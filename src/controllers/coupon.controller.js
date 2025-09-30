
import { z } from 'zod';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { Redemption } from '../models/Redemption.js';
import { PointLedger } from '../models/PointLedger.js';
import { ApiError } from '../utils/error.js';
import { nanoid } from 'nanoid';

export async function listCoupons(req, res, next) {
  try {
    const now = new Date();
    const items = await Coupon.find({
      isActive: true, stock: { $gt: 0 },
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validTo: null }, { validTo: { $gte: now } }] }
      ]
    }).limit(100).lean();
    res.json({ items });
  } catch (e) { next(e); }
}

const redeemSchema = z.object({
  body: z.object({
    couponId: z.string(),
    idempotencyKey: z.string().min(8)
  })
});

export async function redeemCoupon(req, res, next) {
  try {
    const { body } = redeemSchema.parse({ body: req.body });
    const existing = await Redemption.findOne({ idempotencyKey: body.idempotencyKey, userId: req.user.sub });
    if (existing) return res.json({ redemptionId: existing._id, code: existing.code, status: existing.status });
    const coupon = await Coupon.findById(body.couponId);
    if (!coupon || !coupon.isActive || coupon.stock <= 0) throw new ApiError(400, 'Coupon unavailable');
    const user = await User.findById(req.user.sub);
    if (user.points < coupon.pointsCost) throw new ApiError(400, 'Insufficient points');
    user.points -= coupon.pointsCost;
    coupon.stock -= 1;
    const code = nanoid(10).toUpperCase();
    const redemption = await Redemption.create({ userId: user._id, couponId: coupon._id, code, idempotencyKey: body.idempotencyKey, status: 'ISSUED' });
    await Promise.all([user.save(), coupon.save(), PointLedger.create({ userId: user._id, type: 'REDEEM', amount: coupon.pointsCost, ref: redemption._id.toString(), note: `Redeem ${coupon.title}` })]);
    res.status(201).json({ redemptionId: redemption._id, code });
  } catch (e) { next(e); }
}

const verifySchema = z.object({
  body: z.object({ code: z.string().min(6) })
});

export async function verifyAndUse(req, res, next) {
  try {
    const { code } = verifySchema.parse({ body: req.body }).body;
    const red = await Redemption.findOne({ code });
    if (!red || red.status !== 'ISSUED') throw new ApiError(400, 'Invalid or already used');
    const coupon = await Coupon.findById(red.couponId).lean();
    // Only a BUSINESS (matching the coupon.businessId) or ADMIN can consume
    if (req.user.role === 'BUSINESS' && String(req.user.sub) !== String(coupon.businessId)) {
      throw new ApiError(403, 'Not your coupon');
    }
    red.status = 'USED';
    red.usedAt = new Date();
    red.usedByBusinessId = coupon.businessId;
    await red.save();
    res.json({ ok: true, redemptionId: red._id, status: red.status });
  } catch (e) { next(e); }
}
