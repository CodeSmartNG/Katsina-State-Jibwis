import { Router } from 'express';
import User, { ROLES_LIST } from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// List members (scoped by role)
router.get('/', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const filter = {};
    const { role, state, lga, ward, isApproved } = req.query;

    if (req.user.role === 'wardOfficer') {
      filter.state = req.user.state;
      filter.lga = req.user.lga;
      filter.ward = req.user.ward;
    } else if (req.user.role === 'lgaOfficer') {
      filter.state = req.user.state;
      filter.lga = req.user.lga;
    } else if (req.user.role === 'stateAdmin') {
      filter.state = req.user.state;
    }
    if (role) filter.role = role;
    if (state && req.user.role === 'stateAdmin') filter.state = state;
    if (lga) filter.lga = lga;
    if (ward) filter.ward = ward;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Officer creates a member (auto-approved)
router.post('/', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), upload.single('profilePicture'), async (req, res, next) => {
  try {
    // 🚨 DEBUGGING LOGS: Check your Render Logs to see if this is empty
    console.log("--- NEW MEMBER REQUEST ---");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { fullName, email, password, phone, role = 'member', state, lga, ward } = req.body;
    
    // Extract image URL from Cloudinary
    const profilePicture = req.file ? req.file.path : '';

    // Fallback check to catch the exact missing field
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Validation failed: fullName, email, and password are required.',
        receivedBody: req.body 
      });
    }

    // Officer cannot create a role above their own level
    const roleRank = { member: 0, wardOfficer: 1, lgaOfficer: 2, stateAdmin: 3 };
    if (roleRank[role] > roleRank[req.user.role])
      return res.status(403).json({ message: 'Cannot create higher role' });

    const created = await User.create({
      fullName,
      email,
      password,
      phone,
      role,
      rank,
      state: state || req.user.state,
      lga: lga || req.user.lga,
      ward: ward || req.user.ward,
      profilePicture,
      isApproved: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ id: created._id, email: created.email });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    next(err);
  }
});

// Approve a member
router.patch('/:id/approve', authenticate, authorize('wardOfficer', 'lgaOfficer', 'stateAdmin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Approved', id: user._id });
  } catch (err) {
    next(err);
  }
});

// Update role (stateAdmin only)
router.patch('/:id/role', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!ROLES_LIST.includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Toggle active (stateAdmin)
router.patch('/:id/active', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ id: user._id, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
});

// Remove a member (stateAdmin only)
router.delete('/:id', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    // Prevent the admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot remove your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Member removed successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Update own profile (any logged-in user)
router.put('/profile', authenticate, upload.single('profilePicture'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
   //ranks
    router.patch('/:id/rank', authenticate, authorize('stateAdmin'), async (req, res, next) => {
  try {
    const { rank } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { rank },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
    // Update allowed fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.password) user.password = req.body.password; 
    
    // Update image if a new one was uploaded
    if (req.file) user.profilePicture = req.file.path;

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        state: updatedUser.state,
        lga: updatedUser.lga,
        ward: updatedUser.ward,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
      }
    });
  } catch (err) {
    next(err);
  }
});
export default router;
