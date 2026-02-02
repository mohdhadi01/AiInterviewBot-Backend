import type { Request, Response } from 'express';
/** GET /api/focus — list of focus options for onboarding / change focus screen. */
export declare function getFocus(_req: Request, res: Response): Promise<void>;
/** GET /api/focus/domains-map — which domains belong to each focus (for filtering / display). */
export declare function getFocusDomainsMap(_req: Request, res: Response): Promise<void>;
//# sourceMappingURL=focus.controller.d.ts.map