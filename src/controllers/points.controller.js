
import { User } from '../models/User.js';
import { PointLedger } from '../models/PointLedger.js';

export async function getBalance(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).lean();
    const ledger = await PointLedger.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ points: user.points, last50: ledger });
  } catch (e) { next(e); }
}
