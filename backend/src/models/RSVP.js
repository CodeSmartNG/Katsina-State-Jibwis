import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    status: { type: String, enum: ['attending', 'not attending', 'maybe'], required: true },
  },
  { timestamps: true }
);

// Ensure a user can only RSVP once per activity
rsvpSchema.index({ user: 1, activity: 1 }, { unique: true });

export default mongoose.model('RSVP', rsvpSchema);
