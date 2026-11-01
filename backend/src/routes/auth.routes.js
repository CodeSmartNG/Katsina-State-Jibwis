import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6),
  state: z.string().optional().or(z.literal('')),
  lga: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  rank: z.string().optional().or(z.literal('')), // 👈 Added rank validation
  profilePicture: z.string().optional(),
});

// Public self-registration — creates a member awaiting approval
router.post('/register', upload.single('profilePicture'), async (req, res, next) => {
  try {
    const profilePicture = req.file ? req.file.path : '';

    const data = registerSchema.parse({
      ...req.body,
      profilePicture,
    });

    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // 👈 Added rank fallback to 'Member' if left empty
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
        rank: user.rank, // 👈 Added rank
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
    rank: u.rank, // 👈 Added rank
    state: u.state,
    lga: u.lga,
    ward: u.ward,
    profilePicture: u.profilePicture,
  });
});

export default router;
