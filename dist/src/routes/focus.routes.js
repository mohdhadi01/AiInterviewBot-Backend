import { Router } from 'express';
import * as focusController from '../controllers/focus.controller.js';
const router = Router();
router.get('/domains-map', focusController.getFocusDomainsMap);
router.get('/', focusController.getFocus);
export default router;
//# sourceMappingURL=focus.routes.js.map