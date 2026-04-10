import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchDeepSeekWorkflowStages } from './server/deepseekFirstStage'

function readJsonBody(req: IncomingMessage): Promise<{ goal?: string; context?: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'start-now-api-generate-steps',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url?.split('?')[0] ?? ''
            if (url !== '/api/generate-steps' || req.method !== 'POST') {
              next()
              return
            }
            const key = env.DEEPSEEK_API_KEY
            if (!key) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'DEEPSEEK_API_KEY is not set in .env' }))
              return
            }
            try {
              const body = await readJsonBody(req)
              const goal = typeof body.goal === 'string' ? body.goal.trim() : ''
              const context = typeof body.context === 'string' ? body.context.trim() : ''
              if (!goal) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'goal is required' }))
                return
              }
              const stages = await fetchDeepSeekWorkflowStages(goal, context, key)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ stages }))
            } catch (e) {
              const message = e instanceof Error ? e.message : 'error'
              console.error('[dev /api/generate-steps]', message)
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'DeepSeek request failed', detail: message }))
            }
          })
        },
      },
    ],
  }
})
