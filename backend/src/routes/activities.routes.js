import { Router } from 'express';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { scope, state, lga, ward } = req.query;
    const filter = {};
    if (scope) filter.scope = scope;
    if (state) filter.state = state;
    if (lga) filter.lga = lga;
    if (ward) filter.ward = ward;
    const items = await Activity.find(filter)
      .populate('createdBy', 'fullName role')
      .sort({ date: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (req.user.role === 'wardOfficer') {
      payload.scope = 'ward';
      payload.state = req.user.state;
      payload.lga = req.user.lga;
      payload.ward = req.user.ward;
    } else if (req.user.role === 'lgaOfficer') {
      payload.state = req.user.state;
      payload.lga = req.user.lga;
    } else if (req.user.role === 'stateAdmin') {
      payload.state = payload.state ?? req.user.state;
    }

    // 1. Save Activity
    const activity = await Activity.create(payload);

    // 2. Send Email Notifications (Background task)
    const sendEmailBlast = async () => {
      try {
        const filter = { isApproved: true, email: { $exists: true, $ne: '' } };
        if (activity.scope === 'state') filter.state = activity.state;
        if (activity.scope === 'lga') { filter.state = activity.state; filter.lga = activity.lga; }
        if (activity.scope === 'ward') { filter.state = activity.state; filter.lga = activity.lga; filter.ward = activity.ward; }

        const members = await User.find(filter).select('email fullName');
        
        // Format date nicely
        const eventDate = new Date(activity.date).toLocaleString('en-GB', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        for (const member of members) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #0d9488;">JIBWIS Upcoming Activity</h2>
              <p>Dear ${member.fullName},</p>
              <p>A new event has been scheduled in your area.</p>
              <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #0d9488; margin: 20px 0;">
                <h3 style="margin-top: 0;">${activity.title}</h3>
                <p><strong>📅 Date:</strong> ${eventDate}</p>
                <p><strong>📍 Location:</strong> ${activity.location || 'TBA'}</p>
                <p>${activity.description || ''}</p>
              </div>
              <a href="${process.env.FRONTEND_URL}/activities" style="display: inline-block; padding: 10px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 5px;">RSVP on Portal</a>
              <p style="font-size: 12px; color: #666; margin-top: 30px;">You are receiving this because you are an approved member of JIBWIS.</p>
            </div>
          `;

          sendEmail({
            email: member.email,
            subject: `JIBWIS Event: ${activity.title}`,
            message: emailHtml
          }).catch(err => console.error(`Failed to email ${member.email}:`, err.message));
        }
        console.log(`✅ Started sending event emails to ${members.length} members.`);
      } catch (err) {
        console.error('🚨 EMAIL BLAST FAILED:', err.message);
      }
    };

    sendEmailBlast();

    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
