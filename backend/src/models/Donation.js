import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true }, // Stored in Naira (not kobo)
    purpose: { type: String, default: 'General Donation' },
    reference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If logged in
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);
