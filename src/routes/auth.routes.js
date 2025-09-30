
import { Router } from 'express';
import { login, refreshToken, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Rotate device secret (user must be logged in)
router.post('/rotate-device-secret', requireAuth, async (req, res, next) => {
  try {
    const { deviceId } = req.body || {};
    if (!deviceId) throw new Error('deviceId required');
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.user.sub);
    const { clientId, secret } = user.issueDeviceSecret(deviceId);
    await user.save();
    res.json({ deviceId, clientId, secret });
  } catch (e) { next(e); }
});
