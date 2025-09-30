
import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: String,
  description: String,
  pointsCost: { type: Number, required: true },
  validFrom: Date,
  validTo: Date,
  stock: { type: Number, default: 0 }, // number of coupons available
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', CouponSchema);
