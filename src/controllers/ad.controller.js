
import { Ad } from '../models/Ad.js';
import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    mediaUrl: z.string().url().optional(),
    activeFrom: z.string().datetime().optional(),
    activeTo: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    businessId: z.string().optional() // Admin only
  })
});

export async function createAd(req, res, next) {
  try {
    createSchema.parse(req);

    const { title, description, mediaUrl, activeFrom, activeTo, tags, businessId } = req.body;

    let ownerBusinessId = req.user._id; // if business user
    if (req.user.role === 'ADMIN' && businessId) {
      ownerBusinessId = businessId; // admin can create on behalf
    } else if (req.user.role !== 'BUSINESS' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only business or admin can create ads' });
    }

    const ad = await Ad.create({
      businessId: ownerBusinessId,
      title,
      description,
      mediaUrl,
      activeFrom,
      activeTo,
      tags
    });

    res.json({ ok: true, id: ad._id });
  } catch (e) {
    next(e);
  }
}

// Public listing (active ads only)
export async function listAds(req, res, next) {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        { $or: [{ activeFrom: null }, { activeFrom: { $lte: now } }] },
        { $or: [{ activeTo: null }, { activeTo: { $gte: now } }] }
      ]
    };
    if (req.query?.tag) query.tags = req.query.tag;
    if (req.query?.businessId) query.businessId = req.query.businessId;

    const items = await Ad.find(query).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  } catch (e) { next(e); }
}

// Business can list their own ads
export async function listMyAds(req, res, next) {
  try {
    if (req.user.role !== 'BUSINESS' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only business or admin can view their ads' });
    }

    const filter = req.user.role === 'BUSINESS'
      ? { businessId: req.user._id }
      : {}; // admin sees all if needed

    const items = await Ad.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
}

export async function updateAd(req, res, next) {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ error: 'Not found' });

    // Only owner or admin
    if (req.user.role !== 'ADMIN' && ad.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(ad, req.body);
    await ad.save();

    res.json({ ok: true, updatedId: ad._id });
  } catch (e) { next(e); }
}

export async function deleteAd(req, res, next) {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ error: 'Not found' });

    if (req.user.role !== 'ADMIN' && ad.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await ad.deleteOne();
    res.json({ ok: true, deletedId: id });
  } catch (e) { next(e); }
}
