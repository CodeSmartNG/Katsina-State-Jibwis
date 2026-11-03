import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6),
  state: z.string().optional().or(z.literal('')),
  lga: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  rank: z.string().optional().or(z.literal('')),
  profilePicture: z.string().optional(),
});

// Public self-registration
router.post('/register', upload.single('profilePicture'), async (req, res, next) => {
  try {
    const profilePicture = req.file ? req.file.path : '';

    const data = registerSchema.parse({
      ...req.body,
      profilePicture,
    });

    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ 
      ...data, 
      role: 'member', 
      rank: data.rank || 'Member', 
      isApproved: false 
    });
    
    res.status(201).json({
      message: 'Registration submitted. Await approval by an officer.',
      user: { id: user._id, email: user.email, isApproved: user.isApproved },
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ message: 'Validation failed', issues: err.issues });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 👈 FIX: Trim and lowercase the email to prevent hidden space errors
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    // 👈 DEBUGGING LOGS: Check Render to see exactly what is happening
    console.log("--- LOGIN ATTEMPT ---");
    console.log("Email typed:", cleanEmail);
    
    if (!user) {
      console.log("🚨 User not found in database.");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("🚨 Password does not match.");
      return res.status(401).json({ message: 'Invalid credentials' });
    }
      
    if (!user.isApproved) {
      console.log("🚨 Account is pending approval.");
      return res.status(403).json({ message: 'Account pending approval' });
    }

    console.log("✅ Login successful!");
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        rank: user.rank,
        state: user.state,
        lga: user.lga,
        ward: user.ward,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res) => {
  const u = req.user;
  res.json({
    id: u._id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    rank: u.rank,
    state: u.state,
    lga: u.lga,
    ward: u.ward,
    profilePicture: u.profilePicture,
  });
});

// 1. Forgot Password - Send Email
router.post('/forgot-password', async (req, res, next) => {
  try {
    const cleanEmail = req.body.email.trim().toLowerCase(); // 👈 Added clean email
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your JIBWIS Portal account.</p>
      <p>Please click the link below to reset your password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'JIBWIS Portal - Password Reset Request',
        message,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      console.error("🚨 BREVO ERROR:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    next(err);
  }
});

// 2. Reset Password - Verify Token & Save New Password
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (req.body.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 👈 FIX: Trim the password to remove accidental leading/trailing spaces
    user.password = req.body.password.trim(); 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
