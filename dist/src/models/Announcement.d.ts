import { type Document, type Model } from 'mongoose';
export interface IAnnouncementDoc extends Document {
    /** Optional label (e.g. "update-feb-2025"). No longer unique; multiple announcements allowed. */
    slug?: string | null;
    /** Only one announcement should have isActive true; that one is shown in the app. */
    isActive: boolean;
    /** If false, app will not show the modal (even when isActive). */
    show: boolean;
    /** If true, modal has only "Open" button; if false, "Cancel" + "Open". */
    compulsory: boolean;
    title: string;
    message: string;
    openButtonLabel: string;
    cancelButtonLabel: string;
    url: string;
    version: number;
    type?: string | null;
    targetAppVersion?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Announcement: Model<IAnnouncementDoc>;
//# sourceMappingURL=Announcement.d.ts.map