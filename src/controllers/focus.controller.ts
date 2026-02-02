import type { Request, Response } from 'express';
import { getFocusOptions, FOCUS_TO_DOMAINS } from '../models/Focus.js';

/** GET /api/focus — list of focus options for onboarding / change focus screen. */
export async function getFocus(_req: Request, res: Response): Promise<void> {
  try {
    const options = getFocusOptions();
    res.json({ success: true, data: options });
  } catch (err) {
    console.error('[focus] getFocus:', err);
    res.status(500).json({ success: false, error: 'Failed to get focus options' });
  }
}

/** GET /api/focus/domains-map — which domains belong to each focus (for filtering / display). */
export async function getFocusDomainsMap(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ success: true, data: FOCUS_TO_DOMAINS });
  } catch (err) {
    console.error('[focus] getFocusDomainsMap:', err);
    res.status(500).json({ success: false, error: 'Failed to get focus domains map' });
  }
}
