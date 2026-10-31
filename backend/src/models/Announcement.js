import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleHa: { type: String, trim: true },
    body: { type: String, required: true },
    bodyHa: { type: String },
    scope: { type: String, enum: ['national', 'state', 'lga', 'ward'], default: 'national' },
    state: String,
    lga: String,
    ward: String,
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
