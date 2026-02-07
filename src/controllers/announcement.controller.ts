import type { Request, Response } from 'express';
import { Announcement } from '../models/Announcement.js';

/** Public API response: what the app receives. */
export interface AnnouncementDTO {
  id: string;
  show: boolean;
  compulsory: boolean;
  title: string;
  message: string;
  openButtonLabel: string;
  cancelButtonLabel: string;
  url: string;
  version: number;
  type?: string | null;
  targetAppVersion?: string | null;
}

/**
 * GET /api/announcement — public, no auth.
 * Returns the active announcement (isActive true and show true), or legacy slug "current", or null.
 */
export async function getAnnouncement(_req: Request, res: Response): Promise<void> {
  try {
    let doc = await Announcement.findOne({ isActive: true, show: true }).lean();
    if (!doc) {
      doc = await Announcement.findOne({ slug: 'current', show: true }).lean();
    }
    if (!doc) {
      res.json({ success: true, data: null });
      return;
    }
    const dto: AnnouncementDTO = {
      id: String(doc._id),
      show: !!doc.show,
      compulsory: !!doc.compulsory,
      title: doc.title ?? '',
      message: doc.message ?? '',
      openButtonLabel: doc.openButtonLabel ?? 'Open',
      cancelButtonLabel: doc.cancelButtonLabel ?? 'Cancel',
      url: doc.url ?? '',
      version: typeof doc.version === 'number' ? doc.version : 1,
      type: doc.type ?? null,
      targetAppVersion: doc.targetAppVersion ?? null,
    };
    res.json({ success: true, data: dto });
  } catch (err) {
    console.error('[announcement] get:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch announcement' });
  }
}

function isAdminAuthorized(req: Request): boolean {
  const key = req.headers['x-admin-key'] as string | undefined;
  const secret = process.env.ADMIN_SECRET ?? '';
  if (!secret) return true;
  return !!key && key === secret;
}

/** Admin list item. */
export interface AdminAnnouncementListItem {
  id: string;
  slug: string | null;
  isActive: boolean;
  show: boolean;
  compulsory: boolean;
  title: string;
  message: string;
  openButtonLabel: string;
  cancelButtonLabel: string;
  url: string;
  version: number;
  type: string | null;
  targetAppVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /api/admin/announcements — admin only. List all (active first, then by updatedAt desc).
 */
export async function getAdminAnnouncements(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const list = await Announcement.find()
      .sort({ isActive: -1, updatedAt: -1 })
      .lean();
    const data: AdminAnnouncementListItem[] = list.map((doc) => ({
      id: String(doc._id),
      slug: doc.slug ?? null,
      isActive: !!doc.isActive,
      show: !!doc.show,
      compulsory: !!doc.compulsory,
      title: doc.title ?? '',
      message: doc.message ?? '',
      openButtonLabel: doc.openButtonLabel ?? 'Open',
      cancelButtonLabel: doc.cancelButtonLabel ?? 'Cancel',
      url: doc.url ?? '',
      version: typeof doc.version === 'number' ? doc.version : 1,
      type: doc.type ?? null,
      targetAppVersion: doc.targetAppVersion ?? null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error('[admin] getAnnouncements:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
}

/**
 * GET /api/admin/announcements/:id — admin only. Get one by id.
 */
export async function getAdminAnnouncementById(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const { id } = req.params;
    const doc = await Announcement.findById(id).lean();
    if (!doc) {
      res.status(404).json({ success: false, error: 'Announcement not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: String(doc._id),
        slug: doc.slug ?? null,
        isActive: !!doc.isActive,
        show: !!doc.show,
        compulsory: !!doc.compulsory,
        title: doc.title ?? '',
        message: doc.message ?? '',
        openButtonLabel: doc.openButtonLabel ?? 'Open',
        cancelButtonLabel: doc.cancelButtonLabel ?? 'Cancel',
        url: doc.url ?? '',
        version: doc.version ?? 1,
        type: doc.type ?? null,
        targetAppVersion: doc.targetAppVersion ?? null,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      },
    });
  } catch (err) {
    console.error('[admin] getAnnouncementById:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch announcement' });
  }
}

/**
 * POST /api/admin/announcements — admin only. Create new (isActive: false, show: false).
 */
export async function postAdminAnnouncement(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const body = req.body as {
      slug?: string | null;
      title?: string;
      message?: string;
      url?: string;
      show?: boolean;
      compulsory?: boolean;
      openButtonLabel?: string;
      cancelButtonLabel?: string;
      version?: number;
      type?: string | null;
      targetAppVersion?: string | null;
    };
    const doc = await Announcement.create({
      slug: body.slug ?? null,
      isActive: false,
      show: typeof body.show === 'boolean' ? body.show : false,
      compulsory: typeof body.compulsory === 'boolean' ? body.compulsory : false,
      title: typeof body.title === 'string' ? body.title : '',
      message: typeof body.message === 'string' ? body.message : '',
      url: typeof body.url === 'string' ? body.url : '',
      openButtonLabel: typeof body.openButtonLabel === 'string' ? body.openButtonLabel : 'Open',
      cancelButtonLabel: typeof body.cancelButtonLabel === 'string' ? body.cancelButtonLabel : 'Cancel',
      version: typeof body.version === 'number' ? body.version : 1,
      type: body.type ?? null,
      targetAppVersion: body.targetAppVersion ?? null,
    });
    const d = doc.toObject();
    res.status(201).json({
      success: true,
      data: {
        id: String(d._id),
        slug: d.slug ?? null,
        isActive: !!d.isActive,
        show: !!d.show,
        compulsory: !!d.compulsory,
        title: d.title ?? '',
        message: d.message ?? '',
        openButtonLabel: d.openButtonLabel ?? 'Open',
        cancelButtonLabel: d.cancelButtonLabel ?? 'Cancel',
        url: d.url ?? '',
        version: d.version ?? 1,
        type: d.type ?? null,
        targetAppVersion: d.targetAppVersion ?? null,
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : '',
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : '',
      },
    });
  } catch (err) {
    console.error('[admin] postAnnouncement:', err);
    res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
}

/**
 * PUT /api/admin/announcements/:id — admin only. Update one. If body.isActive is true, set others to false.
 */
export async function putAdminAnnouncementById(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const { id } = req.params;
    const body = req.body as {
      slug?: string | null;
      isActive?: boolean;
      show?: boolean;
      compulsory?: boolean;
      title?: string;
      message?: string;
      openButtonLabel?: string;
      cancelButtonLabel?: string;
      url?: string;
      version?: number;
      type?: string | null;
      targetAppVersion?: string | null;
    };
    if (body.isActive === true) {
      await Announcement.updateMany({ _id: { $ne: id } }, { $set: { isActive: false } });
    }
    const doc = await Announcement.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(body.slug !== undefined && { slug: body.slug || null }),
          ...(typeof body.isActive === 'boolean' && { isActive: body.isActive }),
          ...(typeof body.show === 'boolean' && { show: body.show }),
          ...(typeof body.compulsory === 'boolean' && { compulsory: body.compulsory }),
          ...(typeof body.title === 'string' && { title: body.title }),
          ...(typeof body.message === 'string' && { message: body.message }),
          ...(typeof body.openButtonLabel === 'string' && { openButtonLabel: body.openButtonLabel }),
          ...(typeof body.cancelButtonLabel === 'string' && { cancelButtonLabel: body.cancelButtonLabel }),
          ...(typeof body.url === 'string' && { url: body.url }),
          ...(typeof body.version === 'number' && { version: body.version }),
          ...(body.type !== undefined && { type: body.type || null }),
          ...(body.targetAppVersion !== undefined && { targetAppVersion: body.targetAppVersion || null }),
        },
      },
      { new: true }
    ).lean();
    if (!doc) {
      res.status(404).json({ success: false, error: 'Announcement not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: String(doc._id),
        slug: doc.slug ?? null,
        isActive: !!doc.isActive,
        show: !!doc.show,
        compulsory: !!doc.compulsory,
        title: doc.title ?? '',
        message: doc.message ?? '',
        openButtonLabel: doc.openButtonLabel ?? 'Open',
        cancelButtonLabel: doc.cancelButtonLabel ?? 'Cancel',
        url: doc.url ?? '',
        version: doc.version ?? 1,
        type: doc.type ?? null,
        targetAppVersion: doc.targetAppVersion ?? null,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      },
    });
  } catch (err) {
    console.error('[admin] putAnnouncementById:', err);
    res.status(500).json({ success: false, error: 'Failed to update announcement' });
  }
}

/**
 * DELETE /api/admin/announcements/:id — admin only. Remove announcement; it will never show in the app again.
 */
export async function deleteAdminAnnouncementById(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const { id } = req.params;
    const doc = await Announcement.findByIdAndDelete(id);
    if (!doc) {
      res.status(404).json({ success: false, error: 'Announcement not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[admin] deleteAnnouncementById:', err);
    res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
}

/**
 * PATCH /api/admin/announcements/:id/activate — admin only. Set this as active (others to false).
 */
export async function patchAdminAnnouncementActivate(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const { id } = req.params;
    await Announcement.updateMany({}, { $set: { isActive: false } });
    const doc = await Announcement.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true }).lean();
    if (!doc) {
      res.status(404).json({ success: false, error: 'Announcement not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: String(doc._id),
        isActive: true,
        title: doc.title ?? '',
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      },
    });
  } catch (err) {
    console.error('[admin] patchAnnouncementActivate:', err);
    res.status(500).json({ success: false, error: 'Failed to activate announcement' });
  }
}

/**
 * GET /api/admin/announcement — admin only. Returns the active announcement (backward compat).
 */
export async function getAdminAnnouncement(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    let doc = await Announcement.findOne({ isActive: true }).lean();
    if (!doc) doc = await Announcement.findOne({ slug: 'current' }).lean();
    if (!doc) doc = await Announcement.findOne().sort({ updatedAt: -1 }).lean();
    if (!doc) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({
      success: true,
      data: {
        id: String(doc._id),
        slug: doc.slug ?? null,
        isActive: !!doc.isActive,
        show: !!doc.show,
        compulsory: !!doc.compulsory,
        title: doc.title ?? '',
        message: doc.message ?? '',
        openButtonLabel: doc.openButtonLabel ?? 'Open',
        cancelButtonLabel: doc.cancelButtonLabel ?? 'Cancel',
        url: doc.url ?? '',
        version: doc.version ?? 1,
        type: doc.type ?? null,
        targetAppVersion: doc.targetAppVersion ?? null,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      },
    });
  } catch (err) {
    console.error('[admin] getAnnouncement:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch announcement' });
  }
}

/**
 * PUT /api/admin/announcement — admin only. Update the active one (or create and set active). Backward compat.
 */
export async function putAdminAnnouncement(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const body = req.body as {
      show?: boolean;
      compulsory?: boolean;
      title?: string;
      message?: string;
      openButtonLabel?: string;
      cancelButtonLabel?: string;
      url?: string;
      version?: number;
      type?: string | null;
      targetAppVersion?: string | null;
    };
    let doc = await Announcement.findOne({ isActive: true });
    if (!doc) doc = await Announcement.findOne({ slug: 'current' });
    if (!doc) {
      doc = await Announcement.create({
        slug: 'current',
        isActive: true,
        show: false,
        compulsory: false,
        title: '',
        message: '',
        openButtonLabel: 'Open',
        cancelButtonLabel: 'Cancel',
        url: '',
        version: 1,
      });
    }
    if (typeof body.show === 'boolean') doc.show = body.show;
    if (typeof body.compulsory === 'boolean') doc.compulsory = body.compulsory;
    if (typeof body.title === 'string') doc.title = body.title;
    if (typeof body.message === 'string') doc.message = body.message;
    if (typeof body.openButtonLabel === 'string') doc.openButtonLabel = body.openButtonLabel;
    if (typeof body.cancelButtonLabel === 'string') doc.cancelButtonLabel = body.cancelButtonLabel;
    if (typeof body.url === 'string') doc.url = body.url;
    if (typeof body.version === 'number') doc.version = body.version;
    if (body.type !== undefined) doc.type = body.type || null;
    if (body.targetAppVersion !== undefined) doc.targetAppVersion = body.targetAppVersion || null;
    await doc.save();
    const d = doc.toObject();
    res.json({
      success: true,
      data: {
        id: String(d._id),
        slug: d.slug ?? null,
        isActive: !!d.isActive,
        show: !!d.show,
        compulsory: !!d.compulsory,
        title: d.title ?? '',
        message: d.message ?? '',
        openButtonLabel: d.openButtonLabel ?? 'Open',
        cancelButtonLabel: d.cancelButtonLabel ?? 'Cancel',
        url: d.url ?? '',
        version: d.version ?? 1,
        type: d.type ?? null,
        targetAppVersion: d.targetAppVersion ?? null,
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : '',
      },
    });
  } catch (err) {
    console.error('[admin] putAnnouncement:', err);
    res.status(500).json({ success: false, error: 'Failed to save announcement' });
  }
}
