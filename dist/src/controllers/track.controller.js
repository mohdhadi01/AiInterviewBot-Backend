import { getTracks as getTracksFromDb } from '../models/Track.js';
export async function getTracks(_req, res) {
    try {
        const items = await getTracksFromDb();
        res.json({ success: true, data: items });
    }
    catch (err) {
        console.error('[tracks] getTracks:', err);
        res.status(500).json({ success: false, error: 'Failed to get tracks' });
    }
}
//# sourceMappingURL=track.controller.js.map