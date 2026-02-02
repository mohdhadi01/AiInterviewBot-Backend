import { Router } from 'express';
import * as feedController from '../controllers/feed.controller.js';
const router = Router();
router.get('/', feedController.getFeed);
export default router;
//# sourceMappingURL=feed.routes.js.map