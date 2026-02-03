import type { Request, Response } from 'express';
export declare function getUser(req: Request, res: Response): Promise<void>;
export declare function createOrUpdateUser(req: Request, res: Response): Promise<void>;
/** GET /api/users/:userId/preferred-tracks — 4 tracks for home based on user's primaryFocus. */
export declare function getPreferredTracksHandler(req: Request, res: Response): Promise<void>;
/** GET /api/users/:userId/sessions — list interview history (match frontend HistorySession[]). */
export declare function getSessions(req: Request, res: Response): Promise<void>;
/** GET /api/users/:userId/sessions/:sessionId — one session with feedback. */
export declare function getSession(req: Request, res: Response): Promise<void>;
/** POST /api/users/:userId/sessions — add one session (when user ends interview). Optional feedback. */
export declare function addSession(req: Request, res: Response): Promise<void>;
/** DELETE /api/users/:userId/sessions — clear all sessions for user. */
export declare function clearSessions(req: Request, res: Response): Promise<void>;
/** DELETE /api/users/:userId/sessions/:sessionId — remove one session. */
export declare function removeSession(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map