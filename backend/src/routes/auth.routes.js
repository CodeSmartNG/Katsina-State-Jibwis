import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
});

// Public self-registration — creates a member awaiting approval
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ ...data, role: 'member', isApproved: false });
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
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isApproved)
      return res.status(403).json({ message: 'Account pending approval' });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        state: user.state,
        lga: user.lga,
        ward: user.ward,
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
    state: u.state,
    lga: u.lga,
    ward: u.ward,
  });
});

export default router;
