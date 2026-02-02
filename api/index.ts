/**
 * Vercel serverless entry: export the Express app for Vercel's Node runtime.
 * Configure vercel.json with: "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
 * so all requests hit this handler.
 */
import app from '../src/app.js'; // Vercel serverless

export default app;
