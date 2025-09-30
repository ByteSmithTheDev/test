
import mongoose from 'mongoose';

const RedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', index: true },
  code: { type: String, unique: true, index: true },
  status: { type: String, enum: ['ISSUED','USED','CANCELLED','EXPIRED'], default: 'ISSUED', index: true },
  idempotencyKey: { type: String, index: true },
  usedAt: Date,
  usedByBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Redemption = mongoose.model('Redemption', RedemptionSchema);
