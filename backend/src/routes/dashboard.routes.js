import { Router } from 'express';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';
import Activity from '../models/Activity.js';
import Leader from '../models/Leader.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get dashboard statistics (Any logged-in user)
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    // Run all database counts in parallel for speed
    const [
      totalMembers,
      pendingMembers,
      totalAnnouncements,
      totalActivities,
      totalLeaders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: false }),
      Announcement.countDocuments(),
      Activity.countDocuments(),
      Leader.countDocuments()
    ]);

    res.json({
      totalMembers,
      pendingMembers,
      totalAnnouncements,
      totalActivities,
      totalLeaders
    });
  } catch (err) {
    next(err);
  }
});

export default router;
