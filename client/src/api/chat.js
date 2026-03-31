import { getAccessToken } from './client.js'

export async function streamChat(messages, onChunk, onDone, onError) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ messages }),
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur du serveur' }))
      onError(err.error || 'Erreur du serveur')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) onChunk(parsed.text)
            if (parsed.error) onError(parsed.error)
          } catch {}
        }
      }
    }
    onDone()
  } catch (err) {
    onError('Erreur de connexion')
  }
}
