import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchDeepSeekWorkflowStages } from '../server/deepseekFirstStage.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'DEEPSEEK_API_KEY is not configured' })
    return
  }

  let body: { goal?: string; context?: string }
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      body = req.body as { goal?: string; context?: string }
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body || '{}')
    } else {
      body = {}
    }
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const goal = typeof body.goal === 'string' ? body.goal.trim() : ''
  const context = typeof body.context === 'string' ? body.context.trim() : ''
  if (!goal) {
    res.status(400).json({ error: 'goal is required' })
    return
  }

  try {
    const stages = await fetchDeepSeekWorkflowStages(goal, context, apiKey)
    res.status(200).json({ stages })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('[generate-steps]', message)
    res.status(502).json({ error: 'DeepSeek request failed', detail: message })
  }
}
