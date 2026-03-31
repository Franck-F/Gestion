import { streamChat, checkUsageLimit } from '../services/chat.service.js'

export async function chat(req, res, next) {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages requis' })
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || !['user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({ error: 'Format de message invalide' })
      }
      if (msg.content.length > 2000) {
        return res.status(400).json({ error: 'Message trop long (max 2000 caractères)' })
      }
    }

    const trimmed = messages.slice(-20)

    // SSE streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    await streamChat(req.userId, trimmed, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    if (!res.headersSent) {
      if (err.message?.includes('API_KEY') || err.message?.includes('configurée')) {
        return res.status(503).json({ error: 'Le chatbot n\'est pas configuré.' })
      }
      if (err.message?.includes('Limite')) {
        return res.status(429).json({ error: err.message })
      }
      next(err)
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
}

export async function getUsage(req, res, next) {
  try {
    const usage = await checkUsageLimit(req.userId)
    res.json(usage)
  } catch (err) { next(err) }
}
