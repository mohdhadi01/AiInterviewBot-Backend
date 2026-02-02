import { getFeedItems } from '../models/FeedItem.js';
export async function getFeed(_req, res) {
    try {
        const items = await getFeedItems();
        res.json({ success: true, data: items });
    }
    catch (err) {
        console.error('[feed] getFeed:', err);
        res.status(500).json({ success: false, error: 'Failed to get feed' });
    }
}
//# sourceMappingURL=feed.controller.js.map