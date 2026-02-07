import mongoose, { Schema, type Document, type Model } from 'mongoose';

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

const announcementSchema = new Schema<IAnnouncementDoc>(
  {
    slug: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    show: { type: Boolean, default: false },
    compulsory: { type: Boolean, default: false },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    openButtonLabel: { type: String, default: 'Open' },
    cancelButtonLabel: { type: String, default: 'Cancel' },
    url: { type: String, default: '' },
    version: { type: Number, default: 1 },
    type: { type: String, default: null },
    targetAppVersion: { type: String, default: null },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncementDoc> =
  (mongoose.models?.Announcement as Model<IAnnouncementDoc>) ??
  mongoose.model<IAnnouncementDoc>('Announcement', announcementSchema);
