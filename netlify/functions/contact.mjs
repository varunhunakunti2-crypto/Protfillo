// Netlify Function: server-side proxy for the contact form.
//
// Keeps the Web3Forms access key OUT of the client bundle by reading it from
// the server environment. Anyone inspecting the deployed JS can no longer
// harvest the key to spam/impersonate the form.
//
// Required environment variable (set in Netlify dashboard, or via
// `netlify env:set WEB3FORMS_ACCESS_KEY <key>`):
//   WEB3FORMS_ACCESS_KEY

const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(payload),
});

export default async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }

  if (!ACCESS_KEY) {
    console.error('WEB3FORMS_ACCESS_KEY is not configured on the server.');
    return json(500, { success: false, message: 'Server configuration error' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, message: 'Invalid JSON body' });
  }

  // Honeypot: real visitors never fill this in. Accept silently so bots
  // don't learn their submissions are being discarded.
  const gotcha = typeof payload.gotcha === 'string' ? payload.gotcha.trim() : '';
  if (gotcha) {
    return json(200, { success: true });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!name || !email || !message) {
    return json(400, { success: false, message: 'All fields are required' });
  }
  if (name.length > MAX_NAME_LENGTH) {
    return json(400, { success: false, message: 'Name is too long' });
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return json(400, { success: false, message: 'Invalid email address' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json(400, { success: false, message: 'Message is too long' });
  }

  const subject =
    typeof payload.subject === 'string' && payload.subject.trim()
      ? payload.subject.trim()
      : 'New Contact Form Submission from Portfolio';

  try {
    const upstream = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        name,
        email,
        message,
        subject,
      }),
    });

    const result = await upstream.json();

    if (upstream.ok && result.success) {
      return json(200, { success: true });
    }

    console.error('Web3Forms upstream error:', upstream.status, JSON.stringify(result));
    return json(502, { success: false, message: 'Upstream form service error' });
  } catch (error) {
    console.error('Contact function failure:', error);
    return json(502, { success: false, message: 'Upstream form service error' });
  }
}