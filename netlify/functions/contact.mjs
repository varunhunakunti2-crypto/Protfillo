// Netlify Function: server-side proxy for the contact form.
//
// Thin wrapper around server/contact.mjs — the same implementation backs the
// Vercel function (api/contact.js) and the Vite dev middleware, so behaviour
// stays identical across every deployment target.

import { handleContact } from '../../server/contact.mjs';

export default async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  const { status, payload } = await handleContact({
    body: event.body,
    accessKey: process.env.WEB3FORMS_ACCESS_KEY,
  });

  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
}
