import { Router } from 'express';
import Activity from '../models/Activity.js';
import { authenticate, authorize } from '../middleware/auth.js';

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
    const activity = await Activity.create(payload);
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
