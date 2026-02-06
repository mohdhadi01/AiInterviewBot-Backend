import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

/** Aggregated admin user with session stats. */
export interface AdminUserDTO {
  id: string;
  email?: string | null;
  displayName: string;
  avatarUri?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  primaryFocus?: string | null;
  interestDomain?: string | null;
  createdAt: string;
  updatedAt: string;
  sessionCount: number;
  totalDurationSeconds: number;
  lastSessionAt?: string | null;
}

/** Admin session view with user info. */
export interface AdminSessionDTO {
  id: string;
  userId: string;
  userDisplayName?: string;
  userEmail?: string | null;
  domain: string;
  trackId?: string | null;
  difficulty: string;
  focusTopic: string;
  completedAt: string;
  durationSeconds?: number | null;
  feedbackScore?: number | null;
}

/** Domain/interest stats for admin. */
export interface AdminDomainStatsDTO {
  domain: string;
  primaryFocusCount: number;
  sessionCount: number;
  totalDurationSeconds: number;
}

/** Check admin auth via X-Admin-Key header. */
function isAdminAuthorized(req: Request): boolean {
  const key = req.headers['x-admin-key'] as string | undefined;
  const secret = process.env.ADMIN_SECRET ?? '';
  if (!secret) return true; // Allow if no secret configured (dev)
  return !!key && key === secret;
}

/** POST /api/admin/login — authenticate with username/password, returns token for X-Admin-Key. */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    const adminUser = process.env.ADMIN_USERNAME ?? '';
    const adminPass = process.env.ADMIN_PASSWORD ?? '';
    const secret = process.env.ADMIN_SECRET ?? '';

    if (!adminUser || !adminPass) {
      res.status(503).json({ success: false, error: 'Admin login not configured' });
      return;
    }

    if (username !== adminUser || password !== adminPass) {
      res.status(401).json({ success: false, error: 'Invalid username or password' });
      return;
    }

    // Return secret as token; client uses it as X-Admin-Key. If no secret, allow anyway in dev.
    const token = secret || 'ok';
    res.json({ success: true, token });
  } catch (err) {
    console.error('[admin] login:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

/** GET /api/admin/users — list users with session stats. */
export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const skip = Math.max(0, Number(req.query.skip) || 0);

    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const userIds = users.map((u) => u.firebaseUid);
    const sessionAgg = await Session.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          totalDuration: { $sum: { $ifNull: ['$durationSeconds', 0] } },
          lastSession: { $max: '$completedAt' },
        },
      },
    ]);
    const statsMap = new Map(sessionAgg.map((s) => [s._id, s]));

    const data: AdminUserDTO[] = users.map((u) => {
      const s = statsMap.get(u.firebaseUid);
      return {
        id: u.firebaseUid,
        email: u.email ?? null,
        displayName: u.displayName ?? 'User',
        avatarUri: u.avatarUri ?? null,
        photoURL: u.photoURL ?? null,
        phoneNumber: u.phoneNumber ?? null,
        primaryFocus: u.primaryFocus ?? null,
        interestDomain: u.primaryFocus ?? null,
        createdAt: u.createdAt?.toISOString?.() ?? '',
        updatedAt: u.updatedAt?.toISOString?.() ?? '',
        sessionCount: s?.count ?? 0,
        totalDurationSeconds: s?.totalDuration ?? 0,
        lastSessionAt: s?.lastSession ? new Date(s.lastSession).toISOString() : null,
      };
    });

    const total = await User.countDocuments();
    res.json({ success: true, data, total, limit, skip });
  } catch (err) {
    console.error('[admin] getAdminUsers:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
}

/** GET /api/admin/sessions — list sessions with user info. */
export async function getAdminSessions(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const userId = req.query.userId as string | undefined;

    const filter = userId ? { userId } : {};
    const sessions = await Session.find(filter).sort({ completedAt: -1 }).skip(skip).limit(limit).lean();

    const uids = [...new Set(sessions.map((s) => s.userId))];
    const users = await User.find({ firebaseUid: { $in: uids } }).lean();
    const userMap = new Map(users.map((u) => [u.firebaseUid, u]));

    const data: AdminSessionDTO[] = sessions.map((s) => {
      const u = userMap.get(s.userId);
      return {
        id: String(s._id),
        userId: s.userId,
        userDisplayName: u?.displayName,
        userEmail: u?.email ?? null,
        domain: s.domain,
        trackId: s.trackId ?? null,
        difficulty: s.difficulty,
        focusTopic: s.focusTopic ?? '',
        completedAt: s.completedAt instanceof Date ? s.completedAt.toISOString() : String(s.completedAt),
        durationSeconds: s.durationSeconds ?? null,
        feedbackScore: s.feedback?.score ?? null,
      };
    });

    const total = await Session.countDocuments(filter);
    res.json({ success: true, data, total, limit, skip });
  } catch (err) {
    console.error('[admin] getAdminSessions:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
}

/** GET /api/admin/stats — domain/interest stats. */
export async function getAdminStats(req: Request, res: Response): Promise<void> {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const [userCount, sessionCount, domainAgg, focusAgg] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Session.aggregate([
        { $group: { _id: '$domain', count: { $sum: 1 }, totalDuration: { $sum: { $ifNull: ['$durationSeconds', 0] } } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { primaryFocus: { $ne: null, $exists: true } } },
        { $group: { _id: '$primaryFocus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const domainStats: AdminDomainStatsDTO[] = domainAgg.map((d: { _id: string; count: number; totalDuration: number }) => ({
      domain: d._id,
      primaryFocusCount: 0,
      sessionCount: d.count,
      totalDurationSeconds: d.totalDuration,
    }));

    const focusStats = focusAgg.map((f: { _id: string; count: number }) => ({
      focus: f._id,
      count: f.count,
    }));

    res.json({
      success: true,
      data: {
        userCount,
        sessionCount,
        domainStats,
        focusStats,
      },
    });
  } catch (err) {
    console.error('[admin] getAdminStats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
}
