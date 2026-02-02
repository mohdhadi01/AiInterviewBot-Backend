import type { Request, Response } from 'express';
import { getTracks as getTracksFromDb } from '../models/Track.js';

export async function getTracks(_req: Request, res: Response): Promise<void> {
  try {
    const items = await getTracksFromDb();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('[tracks] getTracks:', err);
    res.status(500).json({ success: false, error: 'Failed to get tracks' });
  }
}
