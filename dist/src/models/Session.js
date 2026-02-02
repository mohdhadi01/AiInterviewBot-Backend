import mongoose, { Schema } from 'mongoose';
const sessionSchema = new Schema({
    userId: { type: String, required: true, index: true },
    domain: { type: String, required: true },
    trackId: { type: String, default: null },
    difficulty: { type: String, required: true, enum: ['Junior', 'Mid', 'Senior'] },
    focusTopic: { type: String, required: true, default: '' },
    completedAt: { type: Date, required: true, default: () => new Date() },
    durationSeconds: { type: Number, default: null },
}, { timestamps: true });
sessionSchema.index({ userId: 1, completedAt: -1 });
export const Session = mongoose.models.Session ?? mongoose.model('Session', sessionSchema);
const MAX_SESSIONS_PER_USER = 100;
function toSessionDTO(doc) {
    const o = doc.toObject ? doc.toObject() : doc;
    return {
        id: String(o._id),
        domain: o.domain,
        trackId: o.trackId ?? undefined,
        difficulty: o.difficulty,
        focusTopic: o.focusTopic ?? '',
        completedAt: o.completedAt instanceof Date ? o.completedAt.toISOString() : String(o.completedAt),
        durationSeconds: o.durationSeconds ?? undefined,
    };
}
export async function getSessionsForUser(userId, limit = MAX_SESSIONS_PER_USER) {
    const docs = await Session.find({ userId }).sort({ completedAt: -1 }).limit(limit).lean();
    return docs.map((d) => ({
        id: String(d._id),
        domain: d.domain,
        trackId: d.trackId ?? undefined,
        difficulty: d.difficulty,
        focusTopic: d.focusTopic ?? '',
        completedAt: d.completedAt instanceof Date ? d.completedAt.toISOString() : String(d.completedAt),
        durationSeconds: d.durationSeconds ?? undefined,
    }));
}
export async function addSessionForUser(userId, payload) {
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
export async function clearSessionsForUser(userId) {
    await Session.deleteMany({ userId });
}
export async function removeSessionForUser(userId, sessionId) {
    const result = await Session.findOneAndDelete({ _id: sessionId, userId });
    return !!result;
}
//# sourceMappingURL=Session.js.map