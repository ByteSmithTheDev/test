
import mongoose from 'mongoose';

const WasteSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['PLASTIC','PAPER','METAL','E_WASTE','GLASS','OTHER'], required: true },
  weightKg: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pointsAwarded: { type: Number, default: 0 },
  location: {
    lat: Number, lng: Number, address: String
  }
}, { timestamps: true });

export const WasteSubmission = mongoose.model('WasteSubmission', WasteSubmissionSchema);
