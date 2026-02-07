import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as announcementController from '../controllers/announcement.controller.js';
const router = Router();
router.post('/login', adminController.adminLogin);
router.get('/users', adminController.getAdminUsers);
router.get('/sessions', adminController.getAdminSessions);
router.get('/stats', adminController.getAdminStats);
router.get('/announcement', announcementController.getAdminAnnouncement);
router.put('/announcement', announcementController.putAdminAnnouncement);
router.get('/announcements', announcementController.getAdminAnnouncements);
router.get('/announcements/:id', announcementController.getAdminAnnouncementById);
router.post('/announcements', announcementController.postAdminAnnouncement);
router.put('/announcements/:id', announcementController.putAdminAnnouncementById);
router.patch('/announcements/:id/activate', announcementController.patchAdminAnnouncementActivate);
router.delete('/announcements/:id', announcementController.deleteAdminAnnouncementById);
export default router;
//# sourceMappingURL=admin.routes.js.map