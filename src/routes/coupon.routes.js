
import { Router } from 'express';
import { listCoupons, redeemCoupon, verifyAndUse } from '../controllers/coupon.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { verifyHmac } from '../middleware/hmac.js';

export const router = Router();

router.get('/', listCoupons);
router.post('/redeem', requireAuth, verifyHmac, redeemCoupon);
router.post('/verify', requireAuth, requireRoles('BUSINESS','ADMIN'), verifyAndUse);
