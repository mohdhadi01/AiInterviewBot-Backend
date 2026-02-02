import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/:userId/preferred-tracks', userController.getPreferredTracksHandler);
router.get('/:userId/sessions', userController.getSessions);
router.post('/:userId/sessions', userController.addSession);
router.delete('/:userId/sessions/:sessionId', userController.removeSession);
router.delete('/:userId/sessions', userController.clearSessions);
router.get('/:userId', userController.getUser);
router.post('/:userId', userController.createOrUpdateUser);

export default router;
