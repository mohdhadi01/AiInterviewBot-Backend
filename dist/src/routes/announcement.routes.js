import { Router } from 'express';
import * as announcementController from '../controllers/announcement.controller.js';
const router = Router();
router.get('/announcement', announcementController.getAnnouncement);
export default router;
//# sourceMappingURL=announcement.routes.js.map