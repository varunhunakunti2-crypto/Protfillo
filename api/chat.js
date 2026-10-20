import { createChatReply, normalizeMessages, rateLimit } from "../server/chat.mjs";

/**
 * Vercel serverless function -> POST /api/chat
 * Keeps GROQ_API_KEY on the server; the browser only ever sends the transcript.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const ip =
    (typeof req.headers["x-forwarded-for"] === "string" &&
      req.headers["x-forwarded-for"].split(",")[0].trim()) ||
    req.headers["x-real-ip"] ||
    "unknown";

  const limited = rateLimit(ip);
  if (!limited.ok) {
    res.setHeader("Retry-After", String(limited.retryAfter));
    return res.status(429).json({ error: "rate_limited" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "invalid_json" });
  }

  const { ok, messages, error } = normalizeMessages(body.messages);
  if (!ok) {
    return res.status(400).json({ error: error || "invalid_messages" });
  }

  const result = await createChatReply({
    messages,
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
    locale: typeof body.locale === "string" ? body.locale.slice(0, 8) : undefined,
  });

  if (!result.ok) {
    return res.status(result.status).json({ error: result.code });
  }

  return res.status(200).json({ reply: result.reply });
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
