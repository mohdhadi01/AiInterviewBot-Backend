/**
 * Vercel serverless entry: export the Express app for Vercel's Node runtime.
 * Uses the built app from dist/ (created by buildCommand) so paths resolve at runtime.
 */
import app from '../dist/src/app.js';

export default app;
