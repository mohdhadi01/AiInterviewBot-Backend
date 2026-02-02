import 'dotenv/config';
import mongoose from 'mongoose';
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/aiinterviewbot',
};
let connectPromise = null;
export async function connectDb() {
    if (mongoose.connection.readyState === 1)
        return;
    if (connectPromise)
        return connectPromise;
    connectPromise = mongoose.connect(env.mongodbUri).then(() => {
        console.log('[db] Connected to MongoDB');
    }).catch((err) => {
        console.error('[db] MongoDB connection error:', err);
        connectPromise = null;
        throw err;
    });
    return connectPromise;
}
//# sourceMappingURL=config.js.map