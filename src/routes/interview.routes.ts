import { Router } from 'express';
import * as interviewController from '../controllers/interview.controller.js';

const router = Router();

router.post('/chat', interviewController.chat);
router.post('/analyze', interviewController.analyze);

export default router;
