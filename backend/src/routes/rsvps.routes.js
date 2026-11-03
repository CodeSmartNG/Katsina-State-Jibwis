import { Router } from 'express';
import RSVP from '../models/RSVP.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// 1. Get current user's RSVPs (so the frontend knows which buttons to highlight)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id });
    res.json(rsvps);
  } catch (err) {
    next(err);
  }
});

// 2. Submit or Update an RSVP
router.post('/:activityId', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['attending', 'not attending', 'maybe'].includes(status)) {
      return res.status(400).json({ message: 'Invalid RSVP status' });
    }

    // Upsert (update if exists, create if not)
    const rsvp = await RSVP.findOneAndUpdate(
      { user: req.user._id, activity: req.params.activityId },
      { status },
      { new: true, upsert: true }
    );

    res.json(rsvp);
  } catch (err) {
    next(err);
  }
});

// 3. Get Attendee List for an Activity (Officers/Admins only)
router.get('/activity/:activityId', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const rsvps = await RSVP.find({ activity: req.params.activityId })
      .populate('user', 'fullName email phone profilePicture rank');
    res.json(rsvps);
  } catch (err) {
    next(err);
  }
});

export default router;
