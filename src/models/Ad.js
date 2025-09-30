
import mongoose from 'mongoose';

const AdSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  mediaUrl: { type: String },
  activeFrom: { type: Date, default: null },
  activeTo: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }]
}, { timestamps: true });

export const Ad = mongoose.model('Ad', AdSchema);
