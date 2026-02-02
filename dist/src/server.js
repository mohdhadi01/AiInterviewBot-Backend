import app from './app.js';
import { connectDb, env } from './config.js';
connectDb().then(() => {
    app.listen(env.port, () => {
        console.log(`[server] http://localhost:${env.port}`);
    });
}).catch((err) => {
    console.error('[server]', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map