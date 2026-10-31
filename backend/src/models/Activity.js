import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleHa: { type: String, trim: true },
    description: { type: String },
    descriptionHa: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    scope: { type: String, enum: ['national', 'state', 'lga', 'ward'], default: 'national' },
    state: String,
    lga: String,
    ward: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
