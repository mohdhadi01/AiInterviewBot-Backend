import type { Request, Response } from 'express';
/** Public API response: what the app receives. */
export interface AnnouncementDTO {
    id: string;
    show: boolean;
    compulsory: boolean;
    title: string;
    message: string;
    openButtonLabel: string;
    cancelButtonLabel: string;
    url: string;
    version: number;
    type?: string | null;
    targetAppVersion?: string | null;
}
/**
 * GET /api/announcement — public, no auth.
 * Returns the active announcement (isActive true and show true), or legacy slug "current", or null.
 */
export declare function getAnnouncement(_req: Request, res: Response): Promise<void>;
/** Admin list item. */
export interface AdminAnnouncementListItem {
    id: string;
    slug: string | null;
    isActive: boolean;
    show: boolean;
    compulsory: boolean;
    title: string;
    message: string;
    openButtonLabel: string;
    cancelButtonLabel: string;
    url: string;
    version: number;
    type: string | null;
    targetAppVersion: string | null;
    createdAt: string;
    updatedAt: string;
}
/**
 * GET /api/admin/announcements — admin only. List all (active first, then by updatedAt desc).
 */
export declare function getAdminAnnouncements(req: Request, res: Response): Promise<void>;
/**
 * GET /api/admin/announcements/:id — admin only. Get one by id.
 */
export declare function getAdminAnnouncementById(req: Request, res: Response): Promise<void>;
/**
 * POST /api/admin/announcements — admin only. Create new (isActive: false, show: false).
 */
export declare function postAdminAnnouncement(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/admin/announcements/:id — admin only. Update one. If body.isActive is true, set others to false.
 */
export declare function putAdminAnnouncementById(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/admin/announcements/:id — admin only. Remove announcement; it will never show in the app again.
 */
export declare function deleteAdminAnnouncementById(req: Request, res: Response): Promise<void>;
/**
 * PATCH /api/admin/announcements/:id/activate — admin only. Set this as active (others to false).
 */
export declare function patchAdminAnnouncementActivate(req: Request, res: Response): Promise<void>;
/**
 * GET /api/admin/announcement — admin only. Returns the active announcement (backward compat).
 */
export declare function getAdminAnnouncement(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/admin/announcement — admin only. Update the active one (or create and set active). Backward compat.
 */
export declare function putAdminAnnouncement(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=announcement.controller.d.ts.map