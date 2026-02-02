import { type Document, type Model } from 'mongoose';
/** Matches frontend HistorySession (historySlice). */
export type DifficultyLevel = 'Junior' | 'Mid' | 'Senior';
export interface HistorySessionDTO {
    id: string;
    domain: string;
    trackId?: string;
    difficulty: DifficultyLevel;
    focusTopic: string;
    completedAt: string;
    durationSeconds?: number;
}
export interface ISessionDoc extends Document {
    userId: string;
    domain: string;
    trackId?: string | null;
    difficulty: string;
    focusTopic: string;
    completedAt: Date;
    durationSeconds?: number | null;
    createdAt: Date;
}
export declare const Session: Model<ISessionDoc>;
export declare function getSessionsForUser(userId: string, limit?: number): Promise<HistorySessionDTO[]>;
export declare function addSessionForUser(userId: string, payload: {
    domain: string;
    trackId?: string | null;
    difficulty: DifficultyLevel;
    focusTopic?: string;
    durationSeconds?: number | null;
}): Promise<HistorySessionDTO>;
export declare function clearSessionsForUser(userId: string): Promise<void>;
export declare function removeSessionForUser(userId: string, sessionId: string): Promise<boolean>;
//# sourceMappingURL=Session.d.ts.map