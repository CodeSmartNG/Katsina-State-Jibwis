import { Router } from 'express';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

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

    // 2. Send Email Notifications (Background task)
    const sendEmailBlast = async () => {
      try {
        const filter = { isApproved: true, email: { $exists: true, $ne: '' } };
        if (ann.scope === 'state') filter.state = ann.state;
        if (ann.scope === 'lga') { filter.state = ann.state; filter.lga = ann.lga; }
        if (ann.scope === 'ward') { filter.state = ann.state; filter.lga = ann.lga; filter.ward = ann.ward; }

        const members = await User.find(filter).select('email fullName');
        
        for (const member of members) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #0d9488;">JIBWIS New Announcement</h2>
              <p>Dear ${member.fullName},</p>
              <p>A new announcement has been posted in your area.</p>
              <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #0d9488; margin: 20px 0;">
                <h3 style="margin-top: 0;">${ann.title}</h3>
                <p style="white-space: pre-wrap;">${ann.body}</p>
              </div>
              <a href="${process.env.FRONTEND_URL}/announcements" style="display: inline-block; padding: 10px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 5px;">View on Portal</a>
              <p style="font-size: 12px; color: #666; margin-top: 30px;">You are receiving this because you are an approved member of JIBWIS.</p>
            </div>
          `;

          // Send without await so they fire in parallel (faster for large lists)
          sendEmail({
            email: member.email,
            subject: `JIBWIS Alert: ${ann.title}`,
            message: emailHtml
          }).catch(err => console.error(`Failed to email ${member.email}:`, err.message));
        }
        console.log(`✅ Started sending emails to ${members.length} members.`);
      } catch (err) {
        console.error('🚨 EMAIL BLAST FAILED:', err.message);
      }
    };

    sendEmailBlast(); // Trigger in background

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
