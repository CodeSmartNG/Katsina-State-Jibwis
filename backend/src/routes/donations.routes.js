import { Router } from 'express';
import crypto from 'crypto';
import Donation from '../models/Donation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// 1. Initialize Payment (Public)
router.post('/initialize', async (req, res, next) => {
  try {
    const { email, amount, donorName, purpose } = req.body;

    if (!email || !amount || amount < 100) {
      return res.status(400).json({ message: 'A valid email and amount (min ₦100) are required.' });
    }

    // Paystack expects amount in Kobo (Multiply Naira by 100)
    const amountInKobo = Math.round(amount * 100);
    const reference = `JIBWIS_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Create a pending donation in DB
    await Donation.create({
      donorName: donorName || 'Anonymous',
      email,
      amount,
      purpose,
      reference,
      status: 'pending'
    });

    // Call Paystack Initialize API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/donation-success`,
        metadata: { donorName, purpose }
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error('🚨 PAYSTACK ERROR:', data);
      return res.status(400).json({ message: data.message || 'Payment initialization failed' });
    }

    // Return the authorization URL to the frontend
    res.json({ authorization_url: data.data.authorization_url, reference });
  } catch (err) {
    next(err);
  }
});

// 2. Verify Payment (Public - Called by Frontend after redirect)
router.get('/verify/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      // Update DB to success
      await Donation.findOneAndUpdate(
        { reference },
        { status: 'success' },
        { new: true }
      );
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      await Donation.findOneAndUpdate({ reference }, { status: 'failed' });
      return res.status(400).json({ success: false, message: 'Payment failed or was abandoned' });
    }
  } catch (err) {
    next(err);
  }
});

// 3. Get All Donations (StateAdmin only)
router.get('/', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: 'success' }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    next(err);
  }
});

export default router;
