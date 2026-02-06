import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.post('/login', adminController.adminLogin);
router.get('/users', adminController.getAdminUsers);
router.get('/sessions', adminController.getAdminSessions);
router.get('/stats', adminController.getAdminStats);

export default router;
