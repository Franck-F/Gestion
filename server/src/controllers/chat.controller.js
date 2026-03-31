import { streamChat } from '../services/chat.service.js'

export async function chat(req, res, next) {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages requis' })
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content || !['user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({ error: 'Format de message invalide' })
      }
    }

    // Limit conversation length
    const trimmed = messages.slice(-20)

    // Set up SSE streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    await streamChat(trimmed, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    if (!res.headersSent) {
      if (err.message?.includes('ANTHROPIC_API_KEY')) {
        return res.status(503).json({ error: 'Le chatbot n\'est pas configuré. Contactez l\'administrateur.' })
      }
      next(err)
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
}
