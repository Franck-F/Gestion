import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Briefcase, GraduationCap, FileText, Lightbulb } from 'lucide-react'
import { streamChat } from '../api/chat.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const SUGGESTIONS = [
  { icon: Briefcase, text: 'Comment trouver une alternance rapidement ?' },
  { icon: GraduationCap, text: 'Quelles bourses sont disponibles pour moi ?' },
  { icon: FileText, text: 'Aide-moi à rédiger ma lettre de motivation' },
  { icon: Lightbulb, text: 'Conseils pour réussir un entretien d\'alternance' },
]

function MarkdownText({ text }) {
  // Simple markdown: bold, links, lists
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="pl-4 before:content-['•'] before:absolute before:left-0 relative">{line.slice(2)}</p>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>
        }
        if (line.match(/^\d+\. /)) {
          return <p key={i} className="pl-4">{line}</p>
        }
        if (line.trim() === '') return <br key={i} />
        // Bold inline
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
      })}
    </div>
  )
}

export function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || streaming) return

    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // Add placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    await streamChat(
      newMessages,
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      },
      () => setStreaming(false),
      (error) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Désolé, une erreur est survenue : ${error}`,
            error: true,
          }
          return updated
        })
        setStreaming(false)
      }
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
              <Bot size={32} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold font-heading text-surface-900 mb-2">Assistant MyCheckList</h2>
            <p className="text-surface-400 text-center max-w-md mb-8">
              Expert en alternance, bourses et aides étudiantes. Pose-moi n'importe quelle question !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-surface-200 bg-white hover:border-primary-300 hover:shadow-sm transition-all text-left cursor-pointer"
                >
                  <Icon size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-surface-700">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-primary-600" />
                  </div>
                )}
                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : msg.error
                    ? 'bg-danger-50 text-danger-700 border border-danger-200 rounded-bl-md'
                    : 'bg-white border border-surface-200 text-surface-800 rounded-bl-md'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : msg.content ? (
                    <div className="text-sm leading-relaxed">
                      <MarkdownText text={msg.content} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                    {user?.firstName?.[0]}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-surface-200 bg-white p-3 md:p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question..."
            disabled={streaming}
            className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-xs text-surface-400 mt-2 max-w-3xl mx-auto">
          Propulsé par Claude AI — Les informations fournies sont à vérifier auprès des sources officielles
        </p>
      </div>
    </div>
  )
}
