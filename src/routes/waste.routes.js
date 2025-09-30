
import { Router } from 'express';
import { submitWaste, reviewWaste } from '../controllers/waste.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { verifyHmac } from '../middleware/hmac.js';

export const router = Router();

router.post('/submit', requireAuth, verifyHmac, submitWaste);
router.post('/:id/review', requireAuth, requireRoles('ADMIN'), reviewWaste);
