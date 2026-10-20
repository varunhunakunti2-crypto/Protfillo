import { handleContact } from "../server/contact.mjs";

/**
 * Vercel serverless function -> POST /api/contact
 * Server-side proxy so WEB3FORMS_ACCESS_KEY never reaches the browser.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { status, payload } = await handleContact({
    body: req.body,
    accessKey: process.env.WEB3FORMS_ACCESS_KEY,
  });

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(payload);
}
