import { Router } from 'express';
import Announcement from '../models/Announcement.js';
import { authenticate, authorize } from '../middleware/auth.js';

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
    const ann = await Announcement.create(payload);
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
