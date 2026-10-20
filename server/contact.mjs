/**
 * Shared contact-form proxy logic.
 *
 * Imported by:
 *   - api/contact.js                -> Vercel serverless function
 *   - netlify/functions/contact.mjs -> Netlify function (kept working)
 *   - vite.config.js plugin         -> dev-server middleware
 *
 * The Web3Forms access key is read from the server environment so it is
 * never bundled into the client and can't be harvested from the JS.
 */

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const badRequest = (message) => ({
  status: 400,
  payload: { success: false, message },
});

/**
 * @param {{ body: unknown, accessKey?: string }} options
 * @returns {Promise<{ status: number, payload: Record<string, unknown> }>}
 */
export async function handleContact({ body, accessKey }) {
  if (!accessKey) {
    console.error("[contact] WEB3FORMS_ACCESS_KEY is not configured on the server.");
    return { status: 500, payload: { success: false, message: "Server configuration error" } };
  }

  let payload = body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload || "{}");
    } catch {
      return badRequest("Invalid JSON body");
    }
  }
  if (!payload || typeof payload !== "object") {
    return badRequest("Invalid JSON body");
  }

  // Honeypot: real visitors never fill this in. Accept silently so bots
  // don't learn their submissions are being discarded.
  const gotcha = typeof payload.gotcha === "string" ? payload.gotcha.trim() : "";
  if (gotcha) {
    return { status: 200, payload: { success: true } };
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || !email || !message) {
    return badRequest("All fields are required");
  }
  if (name.length > MAX_NAME_LENGTH) {
    return badRequest("Name is too long");
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return badRequest("Invalid email address");
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return badRequest("Message is too long");
  }

  const subject =
    typeof payload.subject === "string" && payload.subject.trim()
      ? payload.subject.trim()
      : "New Contact Form Submission from Portfolio";

  try {
    const upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ access_key: accessKey, name, email, message, subject }),
    });

    const result = await upstream.json().catch(() => ({}));

    if (upstream.ok && result.success) {
      return { status: 200, payload: { success: true } };
    }

    console.error("[contact] Web3Forms upstream error:", upstream.status, JSON.stringify(result));
    return { status: 502, payload: { success: false, message: "Upstream form service error" } };
  } catch (error) {
    console.error("[contact] proxy failure:", error?.message || error);
    return { status: 502, payload: { success: false, message: "Upstream form service error" } };
  }
}
