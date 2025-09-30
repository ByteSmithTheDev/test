
import mongoose from 'mongoose';

const PointLedgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['EARN','REDEEM'], required: true },
  amount: { type: Number, required: true },
  ref: { type: String }, // e.g., submission id or coupon id
  note: { type: String }
}, { timestamps: true });

export const PointLedger = mongoose.model('PointLedger', PointLedgerSchema);
