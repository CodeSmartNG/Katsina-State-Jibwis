
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['member', 'wardOfficer', 'lgaOfficer', 'stateAdmin'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'member' },

    // Organizational Rank/Title
    rank: { type: String, default: 'Member', trim: true },

    // Organizational Location
    state: { type: String, trim: true },
    lga: { type: String, trim: true },
    ward: { type: String, trim: true },

    // Account Status
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // User Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Profile Picture
    profilePicture: { type: String, default: '' },

    // Password Reset Fields
    resetPasswordToken: { type: String, default: undefined, select: false },
    resetPasswordExpires: { type: Date, default: undefined, select: false },
  },
  { timestamps: true }
);

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const ROLES_LIST = ROLES;

export default mongoose.model('User', userSchema);
