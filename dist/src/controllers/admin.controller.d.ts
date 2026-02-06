import type { Request, Response } from 'express';
/** Aggregated admin user with session stats. */
export interface AdminUserDTO {
    id: string;
    email?: string | null;
    displayName: string;
    avatarUri?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
    primaryFocus?: string | null;
    interestDomain?: string | null;
    createdAt: string;
    updatedAt: string;
    sessionCount: number;
    totalDurationSeconds: number;
    lastSessionAt?: string | null;
}
/** Admin session view with user info. */
export interface AdminSessionDTO {
    id: string;
    userId: string;
    userDisplayName?: string;
    userEmail?: string | null;
    domain: string;
    trackId?: string | null;
    difficulty: string;
    focusTopic: string;
    completedAt: string;
    durationSeconds?: number | null;
    feedbackScore?: number | null;
}
/** Domain/interest stats for admin. */
export interface AdminDomainStatsDTO {
    domain: string;
    primaryFocusCount: number;
    sessionCount: number;
    totalDurationSeconds: number;
}
/** POST /api/admin/login — authenticate with username/password, returns token for X-Admin-Key. */
export declare function adminLogin(req: Request, res: Response): Promise<void>;
/** GET /api/admin/users — list users with session stats. */
export declare function getAdminUsers(req: Request, res: Response): Promise<void>;
/** GET /api/admin/sessions — list sessions with user info. */
export declare function getAdminSessions(req: Request, res: Response): Promise<void>;
/** GET /api/admin/stats — domain/interest stats. */
export declare function getAdminStats(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map