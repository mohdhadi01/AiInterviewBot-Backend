import Groq from 'groq-sdk';
const groqApiKey = process.env.GROQ_API_KEY;
const CHAT_MODEL = 'llama-3.1-8b-instant';
const ANALYZE_MODEL = 'llama-3.3-70b-versatile';
const SYSTEM_PROMPT_GREETING = `You are a professional technical interviewer. Your tone is warm and encouraging.
When the conversation has just started (no prior messages from the candidate), respond with a brief warm greeting and ask the candidate to introduce themselves. Keep it to 1-2 short sentences. Do not ask a technical question yet.`;
const SYSTEM_PROMPT_INTERVIEW = `You are a professional technical interviewer. Follow these rules strictly:
- Keep every response concise (2-4 sentences max).
- Never repeat a question that was already asked in this conversation.
- After the candidate answers, briefly acknowledge their answer (e.g. "Good point", "Thanks for that") in one short phrase, then ask exactly one new technical question.
- The question must match the domain and difficulty given below. When a "Focus area" is specified, ask about that specific area (e.g. React, Hooks, Node.js), not just the broad domain.
- Output only the interviewer's reply text—no labels, no "Interviewer:", no markdown.`;
const SYSTEM_PROMPT_ANALYZE = `You are an expert hiring manager. Output strictly valid JSON with fields: score (number), feedback_summary (string), strengths (array), weaknesses (array).`;
function isRateLimitError(err) {
    if (err && typeof err === 'object' && 'status' in err)
        return err.status === 429;
    return false;
}
/**
 * POST /api/chat
 * Body matches frontend Redux (state.interview): { history, domain?, difficulty?, focusTopic? }
 * Uses Groq llama-3.1-8b-instant. On 429 returns friendly "Server Busy" message.
 */
export async function chat(req, res) {
    try {
        if (!groqApiKey) {
            res.status(503).json({ success: false, error: 'Chat service not configured (missing GROQ_API_KEY)' });
            return;
        }
        const { history = [], topic = '', level = '', difficulty = '', domain = '', focusTopic = '' } = req.body;
        const safeHistory = Array.isArray(history) ? history : [];
        const topicStr = typeof topic === 'string' ? topic : '';
        const domainStr = typeof domain === 'string' ? domain : '';
        const focusStr = typeof focusTopic === 'string' ? focusTopic.trim() : '';
        const levelStr = (typeof difficulty === 'string' && difficulty) ? difficulty : (typeof level === 'string' && level) ? level : 'Mid';
        const groq = new Groq({ apiKey: groqApiKey });
        const hasFocus = focusStr.length > 0 && focusStr.toLowerCase() !== 'general';
        const contextLine = hasFocus
            ? `Domain: ${domainStr || topicStr || 'general'}. Focus area (ask questions about this): ${focusStr}. Difficulty level: ${levelStr}.`
            : `Current topic: ${topicStr || domainStr || 'general'}. Difficulty level: ${levelStr}.`;
        const isFirstTurn = safeHistory.length === 0;
        const systemPrompt = isFirstTurn
            ? SYSTEM_PROMPT_GREETING
            : `${SYSTEM_PROMPT_INTERVIEW}\n\n${contextLine}`;
        const messages = [
            { role: 'system', content: systemPrompt },
            ...safeHistory
                .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
                .map((m) => ({ role: m.role, content: m.content })),
        ];
        const completion = await groq.chat.completions.create({
            model: CHAT_MODEL,
            messages,
            max_tokens: 256,
            temperature: 0.7,
        });
        const content = completion.choices[0]?.message?.content?.trim() ?? '';
        res.json({ success: true, data: { message: content } });
    }
    catch (err) {
        if (isRateLimitError(err)) {
            res.status(503).json({ success: false, error: 'Server busy. Please try again in a moment.' });
            return;
        }
        console.error('[interview] chat:', err);
        res.status(500).json({ success: false, error: 'Failed to generate chat response' });
    }
}
/**
 * POST /api/analyze
 * Body: { transcript }
 * Uses Groq llama-3.3-70b-versatile with response_format: json_object.
 * Returns { score, feedback_summary, strengths, weaknesses }.
 */
export async function analyze(req, res) {
    try {
        if (!groqApiKey) {
            res.status(503).json({ success: false, error: 'Analyze service not configured (missing GROQ_API_KEY)' });
            return;
        }
        const { transcript } = req.body;
        const transcriptStr = typeof transcript === 'string' ? transcript : '';
        if (!transcriptStr.trim()) {
            res.status(400).json({ success: false, error: 'transcript is required' });
            return;
        }
        const groq = new Groq({ apiKey: groqApiKey });
        const completion = await groq.chat.completions.create({
            model: ANALYZE_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT_ANALYZE },
                {
                    role: 'user',
                    content: `Analyze this interview transcript and output strictly valid JSON with: score (number 0-100), feedback_summary (string), strengths (array of strings), weaknesses (array of strings).\n\nTranscript:\n---\n${transcriptStr}\n---`,
                },
            ],
            max_tokens: 1024,
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });
        const text = completion.choices[0]?.message?.content?.trim() ?? '';
        if (!text) {
            res.status(502).json({ success: false, error: 'Empty response from analysis model' });
            return;
        }
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            res.status(502).json({ success: false, error: 'Analysis model did not return valid JSON' });
            return;
        }
        const score = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score) || 0;
        const feedback_summary = typeof parsed.feedback_summary === 'string' ? parsed.feedback_summary : '';
        const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [];
        const weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [];
        res.json({
            success: true,
            data: { score, feedback_summary, strengths, weaknesses },
        });
    }
    catch (err) {
        if (isRateLimitError(err)) {
            res.status(503).json({ success: false, error: 'Server busy. Please try again in a moment.' });
            return;
        }
        console.error('[interview] analyze:', err);
        res.status(500).json({ success: false, error: 'Failed to analyze transcript' });
    }
}
//# sourceMappingURL=interview.controller.js.map