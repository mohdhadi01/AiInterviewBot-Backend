import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    displayName: { type: String, required: false, default: 'User' },
    avatarUri: { type: String, default: null },
    photoURL: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    primaryFocus: { type: String, default: null },
}, { timestamps: true });
function toProfile(doc) {
    const o = doc.toObject ? doc.toObject() : doc;
    return {
        id: o.firebaseUid,
        email: o.email ?? undefined,
        displayName: o.displayName ?? '',
        avatarUri: o.avatarUri ?? o.photoURL ?? null,
        photoURL: o.photoURL ?? o.avatarUri ?? null,
        phoneNumber: o.phoneNumber ?? null,
        primaryFocus: o.primaryFocus ?? null,
        createdAt: o.createdAt?.toISOString?.() ?? undefined,
        updatedAt: o.updatedAt?.toISOString?.() ?? undefined,
    };
}
export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
export { toProfile as userToProfile };
//# sourceMappingURL=User.js.map