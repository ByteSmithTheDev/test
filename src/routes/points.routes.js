
import { Router } from 'express';
import { getBalance } from '../controllers/points.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyHmac } from '../middleware/hmac.js';

export const router = Router();

router.get('/balance', requireAuth, verifyHmac, getBalance);
