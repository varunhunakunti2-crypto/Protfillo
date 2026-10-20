import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { createChatReply, normalizeMessages, rateLimit } from './server/chat.mjs'

/**
 * Local stand-ins for the Vercel functions in api/, so `npm run dev` and
 * `npm run preview` behave exactly like the deployed site. Both handlers are
 * the same modules production imports — one code path, one set of rules.
 */
function serverApiPlugin(env) {
  const handle = (handler) => async (req, res, url) => {
    try {
      const result = await handler(req, url)
      if (!result) return // handler already wrote the response
      res.statusCode = result.status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) res.setHeader(key, value)
      }
      res.end(JSON.stringify(result.payload))
    } catch (err) {
      console.error('[api] dev handler failed:', err)
      if (!res.writableEnded) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'internal_error' }))
      }
    }
  }

  const readBody = async (req) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    try {
      return JSON.parse(raw || '{}')
    } catch {
      return null
    }
  }

  const chatHandler = async (req) => {
    if (req.method !== 'POST') {
      return { status: 405, headers: { Allow: 'POST' }, payload: { error: 'method_not_allowed' } }
    }

    const ip = req.socket?.remoteAddress || 'local'
    const limited = rateLimit(ip)
    if (!limited.ok) {
      return {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfter) },
        payload: { error: 'rate_limited' },
      }
    }

    const body = await readBody(req)
    if (!body || typeof body !== 'object') {
      return { status: 400, payload: { error: 'invalid_json' } }
    }

    const { ok, messages, error } = normalizeMessages(body.messages)
    if (!ok) {
      return { status: 400, payload: { error: error || 'invalid_messages' } }
    }

    const result = await createChatReply({
      messages,
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      locale: typeof body.locale === 'string' ? body.locale.slice(0, 8) : undefined,
    })

    if (!result.ok) {
      return { status: result.status, payload: { error: result.code } }
    }

    return { status: 200, payload: { reply: result.reply } }
  }

  const routes = {
    '/api/chat': handle(chatHandler),
  }

  return {
    name: 'portfolio-server-api',
    configureServer(server) {
      register(server.middlewares)
    },
    configurePreviewServer(server) {
      register(server.middlewares)
    },
  }

  function register(middlewares) {
    middlewares.use((req, res, next) => {
      const url = (req.url || '').split('?')[0]
      const handler = routes[url]
      if (!handler) return next()
      handler(req, res, url)
    })
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      tailwindcss(),
      serverApiPlugin(env),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // Vite only forwards VITE_-prefixed vars to the client, so map the single
    // WEB3FORMS_ACCESS_KEY you set in Vercel / .env.local onto the client-side
    // name. It is a public alias to an email address, not a secret, and the
    // contact form submits from the browser by design.
    define: {
      'import.meta.env.VITE_WEB3FORMS_ACCESS_KEY': JSON.stringify(env.WEB3FORMS_ACCESS_KEY || ''),
    },
  }
})
