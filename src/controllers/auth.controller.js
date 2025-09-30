
import { z } from 'zod';
import { User } from '../models/User.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js';
import { ApiError } from '../utils/error.js';

const regSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    deviceId: z.string().min(4)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    deviceId: z.string().min(4)
  })
});

export async function register(req, res, next) {
  try {
    regSchema.parse({ body: req.body });
    const { email, password, name, deviceId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'Email already registered');
    const user = new User({ email, name, role: 'USER', passwordHash: 'x' });
    await user.setPassword(password);
    const { clientId, secret } = user.issueDeviceSecret(deviceId);
    await user.save();
    const access = signAccess({ sub: user._id.toString(), role: user.role });
    const refresh = signRefresh({ sub: user._id.toString(), role: user.role, deviceId });
    res.status(201).json({ access, refresh, device: { deviceId, clientId, secret } });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    loginSchema.parse({ body: req.body });
    const { email, password, deviceId } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, 'Invalid credentials');
    const ok = await user.verifyPassword(password);
    if (!ok) throw new ApiError(401, 'Invalid credentials');
    const { clientId, secret } = user.issueDeviceSecret(deviceId);
    await user.save();
    const access = signAccess({ sub: user._id.toString(), role: user.role });
    const refresh = signRefresh({ sub: user._id.toString(), role: user.role, deviceId });
    res.json({ access, refresh, device: { deviceId, clientId, secret } });
  } catch (e) { next(e); }
}

export async function refreshToken(req, res, next) {
  try {
    const { refresh } = req.body || {};
    if (!refresh) throw new ApiError(400, 'Missing refresh');
    const payload = verifyRefresh(refresh);
    const access = signAccess({ sub: payload.sub, role: payload.role });
    res.json({ access });
  } catch (e) { next(new ApiError(401, 'Invalid refresh')); }
}
