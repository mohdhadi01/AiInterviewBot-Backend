import mongoose, { Schema, type Document, type Model } from 'mongoose';

/** Matches frontend HistorySession (historySlice). */
export type DifficultyLevel = 'Junior' | 'Mid' | 'Senior';

export interface SessionFeedbackDTO {
  score: number;
  feedback_summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface HistorySessionDTO {
  id: string;
  domain: string;
  trackId?: string;
  difficulty: DifficultyLevel;
  focusTopic: string;
  completedAt: string; // ISO
  durationSeconds?: number;
  feedback?: SessionFeedbackDTO;
}

export interface ISessionDoc extends Document {
  userId: string; // firebaseUid
  domain: string;
  trackId?: string | null;
  difficulty: string;
  focusTopic: string;
  completedAt: Date;
  durationSeconds?: number | null;
  feedback?: {
    score: number;
    feedback_summary: string;
    strengths: string[];
    weaknesses: string[];
  } | null;
  createdAt: Date;
}

const sessionSchema = new Schema<ISessionDoc>(
  {
    userId: { type: String, required: true, index: true },
    domain: { type: String, required: true },
    trackId: { type: String, default: null },
    difficulty: { type: String, required: true, enum: ['Junior', 'Mid', 'Senior'] },
    focusTopic: { type: String, required: true, default: '' },
    completedAt: { type: Date, required: true, default: () => new Date() },
    durationSeconds: { type: Number, default: null },
    feedback: {
      score: { type: Number, default: null },
      feedback_summary: { type: String, default: '' },
      strengths: { type: [String], default: undefined },
      weaknesses: { type: [String], default: undefined },
    },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, completedAt: -1 });

export const Session: Model<ISessionDoc> =
  mongoose.models.Session ?? mongoose.model<ISessionDoc>('Session', sessionSchema);

const MAX_SESSIONS_PER_USER = 100;

function toSessionDTO(doc: ISessionDoc | { _id: unknown; domain: string; trackId?: string | null; difficulty: string; focusTopic?: string; completedAt: Date; durationSeconds?: number | null; feedback?: { score: number; feedback_summary: string; strengths: string[]; weaknesses: string[] } | null }): HistorySessionDTO {
  const o = doc && typeof (doc as ISessionDoc).toObject === 'function' ? (doc as ISessionDoc).toObject() : doc;
  const d = o as { _id: unknown; domain: string; trackId?: string | null; difficulty: string; focusTopic?: string; completedAt: Date; durationSeconds?: number | null; feedback?: { score: number; feedback_summary: string; strengths: string[]; weaknesses: string[] } | null };
  const feedback = d.feedback;
  return {
    id: String(d._id),
    domain: d.domain,
    trackId: d.trackId ?? undefined,
    difficulty: d.difficulty as DifficultyLevel,
    focusTopic: d.focusTopic ?? '',
    completedAt: d.completedAt instanceof Date ? d.completedAt.toISOString() : String(d.completedAt),
    durationSeconds: d.durationSeconds ?? undefined,
    ...(feedback && typeof feedback.score === 'number' && {
      feedback: {
        score: feedback.score,
        feedback_summary: feedback.feedback_summary ?? '',
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
        weaknesses: Array.isArray(feedback.weaknesses) ? feedback.weaknesses : [],
      },
    }),
  };
}

export async function getSessionsForUser(userId: string, limit = MAX_SESSIONS_PER_USER): Promise<HistorySessionDTO[]> {
  const docs = await Session.find({ userId }).sort({ completedAt: -1 }).limit(limit).lean();
  return docs.map((d) => toSessionDTO(d as unknown as ISessionDoc));
}

export async function getSessionByIdForUser(userId: string, sessionId: string): Promise<HistorySessionDTO | null> {
  const doc = await Session.findOne({ _id: sessionId, userId }).lean();
  return doc ? toSessionDTO(doc as unknown as ISessionDoc) : null;
}

export async function addSessionForUser(
  userId: string,
  payload: {
    domain: string;
    trackId?: string | null;
    difficulty: DifficultyLevel;
    focusTopic?: string;
    durationSeconds?: number | null;
    feedback?: SessionFeedbackDTO | null;
  }
): Promise<HistorySessionDTO> {
  const doc = await Session.create({
    userId,
    domain: payload.domain,
    trackId: payload.trackId ?? null,
    difficulty: payload.difficulty,
    focusTopic: payload.focusTopic ?? '',
    completedAt: new Date(),
    durationSeconds: payload.durationSeconds ?? null,
    feedback: payload.feedback
      ? {
          score: payload.feedback.score,
          feedback_summary: payload.feedback.feedback_summary ?? '',
          strengths: payload.feedback.strengths ?? [],
          weaknesses: payload.feedback.weaknesses ?? [],
        }
      : null,
  });
  const count = await Session.countDocuments({ userId });
  if (count > MAX_SESSIONS_PER_USER) {
    const oldest = await Session.find({ userId }).sort({ completedAt: 1 }).limit(count - MAX_SESSIONS_PER_USER).select('_id');
    await Session.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
  }
  return toSessionDTO(doc);
}

export async function clearSessionsForUser(userId: string): Promise<void> {
  await Session.deleteMany({ userId });
}

export async function removeSessionForUser(userId: string, sessionId: string): Promise<boolean> {
  const result = await Session.findOneAndDelete({ _id: sessionId, userId });
  return !!result;
}
