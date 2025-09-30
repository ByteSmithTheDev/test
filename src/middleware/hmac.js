
import crypto from 'crypto';
import { ApiError } from '../utils/error.js';
import { User } from '../models/User.js';

/**
 * Optional HMAC middleware to thwart request forging from reverse-engineered apps.
 * After login, client stores deviceId + clientId + secret and signs each request body.
 * Headers required: X-Device-Id, X-Client-Id, X-Nonce, X-Timestamp, X-Signature (hex).
 */
export async function verifyHmac(req, res, next) {
  try {
    const deviceId = req.header('X-Device-Id');
    const clientId = req.header('X-Client-Id');
    const nonce = req.header('X-Nonce');
    const ts = req.header('X-Timestamp');
    const sig = req.header('X-Signature');
    if (!deviceId || !clientId || !nonce || !ts || !sig) {
      return next(new ApiError(400, 'Missing HMAC headers'));
    }
    // replay window 5 min
    const now = Date.now();
    if (Math.abs(now - Number(ts)) > 5 * 60 * 1000) {
      return next(new ApiError(401, 'Stale timestamp'));
    }
    const userId = req.user?.sub;
    if (!userId) return next(new ApiError(401, 'Unauthenticated'));
    const user = await User.findById(userId).lean();
    const device = user?.deviceSecrets?.find(d => d.deviceId === deviceId && d.clientId === clientId);
    if (!device) return next(new ApiError(401, 'Device not registered'));
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const base = `${deviceId}.${clientId}.${nonce}.${ts}.${body}`;
    const h = crypto.createHmac('sha256', device.secret).update(base).digest('hex');
    if (h !== sig) return next(new ApiError(401, 'Bad HMAC signature'));
    return next();
  } catch (e) {
    return next(new ApiError(401, 'HMAC verification failed'));
  }
}
