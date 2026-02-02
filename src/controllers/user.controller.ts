import type { Request, Response } from 'express';
import { User, userToProfile } from '../models/User.js';
import { getTracks as getTracksFromDb } from '../models/Track.js';
import { getPreferredTracks } from '../models/Track.js';
import {
  getSessionsForUser,
  addSessionForUser,
  clearSessionsForUser,
  removeSessionForUser,
  type DifficultyLevel,
} from '../models/Session.js';

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    const doc = await User.findOne({ firebaseUid: userId });
    if (!doc) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: userToProfile(doc) });
  } catch (err) {
    console.error('[user] getUser:', err);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
}

export async function createOrUpdateUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { displayName, avatarUri, photoURL, primaryFocus, email } = req.body as {
      displayName?: string;
      avatarUri?: string | null;
      photoURL?: string | null;
      primaryFocus?: string | null;
      email?: string | null;
    };
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    let doc = await User.findOneAndUpdate(
      { firebaseUid: userId },
      {
        ...(displayName !== undefined && { displayName: String(displayName).trim() }),
        ...(avatarUri !== undefined && { avatarUri }),
        ...(photoURL !== undefined && { photoURL }),
        ...(primaryFocus !== undefined && { primaryFocus: primaryFocus ?? null }),
        ...(email !== undefined && { email: email ?? null }),
      },
      { new: true }
    );
    if (!doc) {
      const name =
        displayName != null && String(displayName).trim() !== ''
          ? String(displayName).trim()
          : 'User';
      doc = await User.create({
        firebaseUid: userId,
        displayName: name,
        email: email ?? null,
        photoURL: photoURL ?? avatarUri ?? null,
        primaryFocus: primaryFocus ?? null,
      });
    }
    res.json({ success: true, data: userToProfile(doc) });
  } catch (err) {
    console.error('[user] createOrUpdateUser:', err);
    res.status(500).json({ success: false, error: 'Failed to create/update user' });
  }
}

/** GET /api/users/:userId/preferred-tracks — 4 tracks for home based on user's primaryFocus. */
export async function getPreferredTracksHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    const user = await User.findOne({ firebaseUid: userId }).lean();
    const primaryFocus = user?.primaryFocus ?? null;
    const allTracks = await getTracksFromDb();
    const preferred = getPreferredTracks(allTracks, primaryFocus);
    res.json({ success: true, data: preferred });
  } catch (err) {
    console.error('[user] getPreferredTracks:', err);
    res.status(500).json({ success: false, error: 'Failed to get preferred tracks' });
  }
}

/** GET /api/users/:userId/sessions — list interview history (match frontend HistorySession[]). */
export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 100;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    const sessions = await getSessionsForUser(userId, limit);
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('[user] getSessions:', err);
    res.status(500).json({ success: false, error: 'Failed to get sessions' });
  }
}

/** POST /api/users/:userId/sessions — add one session (when user ends interview). */
export async function addSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { domain, trackId, difficulty, focusTopic, durationSeconds } = req.body as {
      domain: string;
      trackId?: string | null;
      difficulty?: DifficultyLevel;
      focusTopic?: string;
      durationSeconds?: number | null;
    };
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    if (!domain || !difficulty) {
      res.status(400).json({ success: false, error: 'domain and difficulty are required' });
      return;
    }
    const session = await addSessionForUser(userId, {
      domain,
      trackId,
      difficulty,
      focusTopic,
      durationSeconds,
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[user] addSession:', err);
    res.status(500).json({ success: false, error: 'Failed to add session' });
  }
}

/** DELETE /api/users/:userId/sessions — clear all sessions for user. */
export async function clearSessions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    await clearSessionsForUser(userId);
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('[user] clearSessions:', err);
    res.status(500).json({ success: false, error: 'Failed to clear sessions' });
  }
}

/** DELETE /api/users/:userId/sessions/:sessionId — remove one session. */
export async function removeSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const sessionId = req.params.sessionId as string;
    if (!userId || !sessionId) {
      res.status(400).json({ success: false, error: 'userId and sessionId are required' });
      return;
    }
    const removed = await removeSessionForUser(userId, sessionId);
    if (!removed) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[user] removeSession:', err);
    res.status(500).json({ success: false, error: 'Failed to remove session' });
  }
}
