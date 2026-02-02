import { type Document, type Model } from 'mongoose';
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
declare function toProfile(doc: IUserDoc): UserProfile;
export declare const User: Model<IUserDoc>;
export { toProfile as userToProfile };
//# sourceMappingURL=User.d.ts.map