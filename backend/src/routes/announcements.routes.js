import { Router } from 'express';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js'; // 👈 Imported User model
import { authenticate, authorize } from '../middleware/auth.js';
import { sendSms } from '../utils/sendSms.js'; // 👈 Imported SMS utility

const router = Router();

// Public list of published announcements
router.get('/', async (req, res, next) => {
  try {
    const { scope, state, lga, ward } = req.query;
    const filter = { published: true };
    if (scope) filter.scope = scope;
    if (state) filter.state = state;
    if (lga) filter.lga = lga;
    if (ward) filter.ward = ward;

    const items = await Announcement.find(filter)
      .populate('createdBy', 'fullName role')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    
    // Force scope for lower roles
    if (req.user.role === 'wardOfficer') {
      payload.scope = 'ward';
      payload.state = req.user.state;
      payload.lga = req.user.lga;
      payload.ward = req.user.ward;
    } else if (req.user.role === 'lgaOfficer') {
      payload.scope = payload.scope === 'state' ? 'lga' : payload.scope;
      payload.state = req.user.state;
      payload.lga = req.user.lga;
    } else if (req.user.role === 'stateAdmin') {
      payload.state = payload.state ?? req.user.state;
    }

    // 1. Save the Announcement
    const ann = await Announcement.create(payload);

    // 2. Send SMS Notifications (Fire and forget)
    // We don't use 'await' here so the API response isn't delayed by the SMS provider
    const sendNotifications = async () => {
      try {
        // Find approved users with phone numbers based on the announcement scope
        const filter = { isApproved: true, phone: { $exists: true, $ne: '' } };
        if (ann.scope === 'state') filter.state = ann.state;
        if (ann.scope === 'lga') { filter.state = ann.state; filter.lga = ann.lga; }
        if (ann.scope === 'ward') { filter.state = ann.state; filter.lga = ann.lga; filter.ward = ann.ward; }

        const members = await User.find(filter).select('phone');
        
        if (members.length > 0) {
          // Format phone numbers to international format for Termii (e.g., 2348012345678)
          const phoneNumbers = members.map(m => {
            let p = m.phone.replace(/\D/g, ''); // Remove non-digits (like spaces or dashes)
            if (p.startsWith('0')) p = '234' + p.slice(1); // Convert 080... to 23480...
            return p;
          });

          const message = `JIBWIS Alert: ${ann.title}. Log in to the portal for full details.`;

          await sendSms({
            to: phoneNumbers,
            message: message
          });
          console.log(`✅ SMS sent to ${phoneNumbers.length} members.`);
        }
      } catch (smsErr) {
        console.error('🚨 SMS SENDING FAILED:', smsErr.message);
      }
    };

    // Trigger SMS in the background
    sendNotifications();

    // 3. Return success response immediately
    res.status(201).json(ann);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ message: 'Not found' });
    res.json(ann);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
