import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  avatarUri?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  /** Career focus chosen on onboarding / change focus (e.g. Frontend, Backend). */
  primaryFocus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserDoc extends Document {
  firebaseUid: string;
  email?: string | null;
  displayName: string;
  avatarUri?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  primaryFocus?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDoc>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    displayName: { type: String, required: false, default: 'User' },
    avatarUri: { type: String, default: null },
    photoURL: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    primaryFocus: { type: String, default: null },
  },
  { timestamps: true }
);

function toProfile(doc: IUserDoc): UserProfile {
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

export const User: Model<IUserDoc> =
  mongoose.models.User ?? mongoose.model<IUserDoc>('User', userSchema);

export { toProfile as userToProfile };
