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
    
    // 👇 NEW: Organizational Rank/Title (e.g., Chairman, Secretary, Member)
    rank: { type: String, default: 'Member', trim: true }, 
    
    state: { type: String, trim: true },
    lga: { type: String, trim: true },
    ward: { type: String, trim: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profilePicture: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const ROLES_LIST = ROLES;
export default mongoose.model('User', userSchema);
