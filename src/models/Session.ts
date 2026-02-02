import mongoose, { Schema, type Document, type Model } from 'mongoose';

/** Matches frontend HistorySession (historySlice). */
export type DifficultyLevel = 'Junior' | 'Mid' | 'Senior';

export interface HistorySessionDTO {
  id: string;
  domain: string;
  trackId?: string;
  difficulty: DifficultyLevel;
  focusTopic: string;
  completedAt: string; // ISO
  durationSeconds?: number;
}

export interface ISessionDoc extends Document {
  userId: string; // firebaseUid
  domain: string;
  trackId?: string | null;
  difficulty: string;
  focusTopic: string;
  completedAt: Date;
  durationSeconds?: number | null;
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
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, completedAt: -1 });

export const Session: Model<ISessionDoc> =
  mongoose.models.Session ?? mongoose.model<ISessionDoc>('Session', sessionSchema);

const MAX_SESSIONS_PER_USER = 100;

function toSessionDTO(doc: ISessionDoc): HistorySessionDTO {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    domain: o.domain,
    trackId: o.trackId ?? undefined,
    difficulty: o.difficulty as DifficultyLevel,
    focusTopic: o.focusTopic ?? '',
    completedAt: o.completedAt instanceof Date ? o.completedAt.toISOString() : String(o.completedAt),
    durationSeconds: o.durationSeconds ?? undefined,
  };
}

export async function getSessionsForUser(userId: string, limit = MAX_SESSIONS_PER_USER): Promise<HistorySessionDTO[]> {
  const docs = await Session.find({ userId }).sort({ completedAt: -1 }).limit(limit).lean();
  return docs.map((d: { _id: unknown; domain: string; trackId?: string | null; difficulty: string; focusTopic?: string; completedAt: Date; durationSeconds?: number | null }) => ({
    id: String(d._id),
    domain: d.domain,
    trackId: d.trackId ?? undefined,
    difficulty: d.difficulty as DifficultyLevel,
    focusTopic: d.focusTopic ?? '',
    completedAt: d.completedAt instanceof Date ? d.completedAt.toISOString() : String(d.completedAt),
    durationSeconds: d.durationSeconds ?? undefined,
  }));
}

export async function addSessionForUser(
  userId: string,
  payload: {
    domain: string;
    trackId?: string | null;
    difficulty: DifficultyLevel;
    focusTopic?: string;
    durationSeconds?: number | null;
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
