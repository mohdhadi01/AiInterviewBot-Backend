import mongoose, { Schema } from 'mongoose';
const announcementSchema = new Schema({
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
}, { timestamps: true });
export const Announcement = mongoose.models?.Announcement ??
    mongoose.model('Announcement', announcementSchema);
//# sourceMappingURL=Announcement.js.map