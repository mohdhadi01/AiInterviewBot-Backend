import type { Request, Response } from 'express';
import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY;

const CHAT_MODEL = 'llama-3.1-8b-instant';
const ANALYZE_MODEL = 'llama-3.3-70b-versatile';

// const SYSTEM_PROMPT_GREETING = `You are a professional technical interviewer. Your tone is warm and encouraging.
// When the conversation has just started (no prior messages from the candidate), respond with a brief warm greeting and ask the candidate to introduce themselves.
// Keep it to 1-2 short sentences. Do not ask a technical question yet.

// Very important: respond in STRICTLY valid JSON with exactly these fields:
// - feedback: a string. For the first turn this MUST be an empty string "".
// - question: a string. This should contain your spoken greeting / introduction request only.

// Do not include any other keys, markdown, code fences, or explanatory text.`;

// const SYSTEM_PROMPT_INTERVIEW = `You are a professional technical interviewer. Follow these rules strictly:
// - Keep every response concise (2-4 sentences max overall).
// - Never repeat a question that was already asked in this conversation.
// - After the candidate answers, briefly acknowledge their answer in ONE short, natural phrase that is varied over time.
//   - Examples: "Nice example about X", "I see what you mean about Y", "That's a reasonable approach", "Interesting perspective".
//   - Do NOT overuse generic phrases like "Good point" or "Thanks for that". Avoid repeating the same opening line across turns.
//   - Tailor the feedback to the content of the candidate's answer when possible.
// - Then ask exactly ONE new technical question.
// - The question must match the domain and difficulty given below. When a "Focus area" is specified, ask about that specific area (e.g. React, Hooks, Node.js), not just the broad domain.

// Very important: respond in STRICTLY valid JSON with exactly these fields:
// - feedback: a short string (1 sentence max) containing ONLY your brief acknowledgement of their last answer. Do NOT restate the question here.
// - question: a string containing EXACTLY ONE new technical interview question.

// Do not include any other keys, markdown, code fences, or explanatory text.`;

// const SYSTEM_PROMPT_ANALYZE = `You are an expert hiring manager. Output strictly valid JSON with fields: score (number), feedback_summary (string), strengths (array), weaknesses (array).`;


const SYSTEM_PROMPT_GREETING = `
You are a Senior Technical Hiring Manager at a top-tier tech company. 
Your tone is professional, warm, and inviting, but efficient.

Task:
1. Start with a friendly "Hello" using the candidate's name if available.
2. Briefly state the purpose of this session (a technical screening).
3. Ask the candidate to introduce themselves, focusing on their technical background.

Constraints:
- Keep it under 2 short sentences.
- Do NOT ask a specific technical question yet (wait for the introduction).

Output strictly valid JSON:
{
  "feedback": "",
  "question": "your greeting string here"
}
`;

const SYSTEM_PROMPT_INTERVIEW = `
You are a Senior Technical Interviewer. 
Your goal is to assess depth of knowledge with a fast-paced, conversational flow.

RULES FOR FEEDBACK (Micro-Feedback Only):
- **Strict Limit:** Max 10-15 words.
- **Be Relatable:** Mention EXACTLY ONE specific keyword they used to prove you listened.
- **Style:** Natural, conversational fragments.
- Examples:
  - Correct: "Spot on regarding the dependency array."
  - Vagueness: "You're close, specifically on the memory management side."
  - Wrong: "Not quite—that's actually for class components."

RULES FOR QUESTIONING:
- Ask exactly ONE new technical question.
- The question must match the Domain, Topic, and Difficulty Level provided in the context below.
- Do NOT repeat questions.

Output strictly valid JSON:
{
  "feedback": "Your micro-feedback (Max 15 words, must cite a keyword).",
  "question": "Your new technical question."
}
`;

const SYSTEM_PROMPT_ANALYZE = `
You are the Bar Raiser (Final Decision Maker) on a Hiring Committee. 
Analyze the interview transcript provided.

SCORING RUBRIC:
- 0-40: Fails basic concepts.
- 41-70: Good, but lacks depth or missed edge cases.
- 71-90: Strong, production-ready knowledge.
- 91-100: Expert level, deep understanding of internals.

OUTPUT INSTRUCTIONS:
- score: An integer (0-100) based on the rubric.
- feedback_summary: A 2-3 sentence executive summary. Was it a "Hire" or "No Hire"? Why?
- strengths: A list of specific concepts the candidate explained well (e.g., "Strong grasp of React Lifecycle").
- weaknesses: A list of specific gaps found (e.g., "Missed error handling in async functions", "Confused useMemo vs useCallback").

Output strictly valid JSON matching the AnalyzeResult interface.
`;
export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestBody {
  history: ChatHistoryMessage[];
  /** Match frontend Redux: domain from track.domain (e.g. "Frontend", "Backend"). */
  domain?: string;
  /** Match frontend Redux: difficulty from state.interview.difficulty — "Junior" | "Mid" | "Senior". Accepted as "level" or "difficulty". */
  difficulty?: string;
  /** Alias for difficulty; frontend may send either level or difficulty. */
  level?: string;
  /** Legacy single focus topic — \"General\" or one area (e.g. \"React\"). */
  focusTopic?: string;
  /** New: multiple selected focus areas, e.g. [\"Hooks\", \"Performance\"]. */
  focusTopics?: string[];
  /** Optional fallback topic if domain not sent (e.g. track title). */
  topic?: string;
}

export interface AnalyzeRequestBody {
  transcript: string;
}

export interface AnalyzeResult {
  score: number;
  feedback_summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ChatTurnResult {
  feedback: string;
  question: string;
}

/** From a combined feedback+question string, extract just the final question sentence. */
function extractQuestionFromText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Grab the last sentence that ends with a question mark.
  const match = trimmed.match(/([^?]*\?)(?![\s\S]*\?)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: return full text when no clear question sentence is found.
  return trimmed;
}

function isRateLimitError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'status' in err) return (err as { status: number }).status === 429;
  return false;
}

/**
 * POST /api/chat
 * Body matches frontend Redux (state.interview): { history, domain?, difficulty?, focusTopic? }
 * Uses Groq llama-3.1-8b-instant. On 429 returns friendly "Server Busy" message.
 */
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    if (!groqApiKey) {
      res.status(503).json({ success: false, error: 'Chat service not configured (missing GROQ_API_KEY)' });
      return;
    }

    const {
      history = [],
      topic = '',
      level = '',
      difficulty = '',
      domain = '',
      focusTopic = '',
      focusTopics = [],
    } = req.body as ChatRequestBody;
    const safeHistory = Array.isArray(history) ? history : [];
    const topicStr = typeof topic === 'string' ? topic : '';
    const domainStr = typeof domain === 'string' ? domain : '';
    const focusStr = typeof focusTopic === 'string' ? focusTopic.trim() : '';
    const focusList = Array.isArray(focusTopics)
      ? focusTopics.map((f) => String(f).trim()).filter((f) => f && f.toLowerCase() !== 'general')
      : [];
    const levelStr = (typeof difficulty === 'string' && difficulty) ? difficulty : (typeof level === 'string' && level) ? level : 'Mid';

    const groq = new Groq({ apiKey: groqApiKey });

    const hasFocusArray = focusList.length > 0;
    const hasSingleFocus = focusStr.length > 0 && focusStr.toLowerCase() !== 'general';
    const allFocuses = hasFocusArray ? focusList : hasSingleFocus ? [focusStr] : [];
    const focusLabel = allFocuses.join(', ');

    const hasAnyFocus = allFocuses.length > 0;
    const contextLine = hasAnyFocus
      ? `Domain: ${domainStr || topicStr || 'general'}. Focus areas (ask questions about these): ${focusLabel}. Difficulty level: ${levelStr}.`
      : `Current topic: ${topicStr || domainStr || 'general'}. Difficulty level: ${levelStr}.`;

    const isFirstTurn = safeHistory.length === 0;
    const systemPrompt = isFirstTurn
      ? SYSTEM_PROMPT_GREETING
      : `${SYSTEM_PROMPT_INTERVIEW}\n\n${contextLine}`;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...safeHistory
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 256,
      temperature: 0.7,
      // Ask model to return a JSON object to make parsing more reliable
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? '';

    let parsed: ChatTurnResult = { feedback: '', question: '' };
    if (content) {
      try {
        const raw = JSON.parse(content) as Partial<ChatTurnResult>;
        const feedback = typeof raw.feedback === 'string' ? raw.feedback.trim() : '';
        const rawQuestion = typeof raw.question === 'string' ? raw.question : '';
        const cleanedQuestion = extractQuestionFromText(rawQuestion);
        parsed = {
          feedback,
          question: cleanedQuestion || feedback || '',
        };
      } catch {
        // Fallback: treat entire text as the question if JSON parsing fails
        parsed = { feedback: '', question: extractQuestionFromText(content) };
      }
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
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
export async function analyze(req: Request, res: Response): Promise<void> {
  try {
    if (!groqApiKey) {
      res.status(503).json({ success: false, error: 'Analyze service not configured (missing GROQ_API_KEY)' });
      return;
    }

    const { transcript } = req.body as AnalyzeRequestBody;
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

    let parsed: AnalyzeResult;
    try {
      parsed = JSON.parse(text) as AnalyzeResult;
    } catch {
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
  } catch (err) {
    if (isRateLimitError(err)) {
      res.status(503).json({ success: false, error: 'Server busy. Please try again in a moment.' });
      return;
    }
    console.error('[interview] analyze:', err);
    res.status(500).json({ success: false, error: 'Failed to analyze transcript' });
  }
}
