'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ArticleDraft {
  slug: string
  title: string
  meta_title: string
  meta_desc: string
  keywords: string
  category: string
  content: string
  image_url: string | null
  image_alt: string | null
  author: string
}

interface Props {
  onArticleReady: (draft: ArticleDraft) => void
  onSwitchToEditor?: () => void
}

const STARTER_PROMPTS = [
  'Escríbeme un artículo sobre la selección de México en el Mundial 2026',
  'Crea un artículo de marketing sobre cómo anunciarse en el Mundial',
  'Quiero un análisis de los grupos del Mundial 2026',
  'Artículo sobre las sedes del Mundial en Estados Unidos',
]

export default function AIChat({ onArticleReady, onSwitchToEditor }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola Jorge! Soy tu asistente editorial con SEO integrado. Dime sobre qué quieres escribir y crearé un artículo optimizado para el Mundial 2026. Puedes darme el tema, el ángulo que quieres cubrir, y el público objetivo (fans, marcas, anunciantes).',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Store the last successfully parsed article so "Ver borrador" can re-pass it
  const [lastArticle, setLastArticle] = useState<ArticleDraft | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }])

      if (data.article) {
        setLastArticle(data.article)
        onArticleReady(data.article)
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleVerBorrador() {
    // Always re-pass the article when the user manually clicks the button
    if (lastArticle) onArticleReady(lastArticle)
    onSwitchToEditor?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {/* Starter prompts - only show before any user message */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-white/5 border border-white/20 text-white/60 px-3 py-2 hover:bg-gold/10 hover:border-gold hover:text-gold transition-colors font-black text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 flex items-center justify-center shrink-0 mt-1 ${msg.role === 'assistant' ? 'bg-gold text-navy' : 'bg-white/10 text-white'}`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white/5 border border-white/10 text-white/80'
                  : 'bg-gold/10 border border-gold/30 text-white'
              }`}>
                {msg.role === 'assistant' && msg.content.includes('"slug"') && msg.content.includes('"content"') ? (
                  <div className="space-y-2">
                    <p className="text-green-400 font-black text-xs uppercase tracking-widest">✓ Artículo generado</p>
                    <p className="text-white/60 text-sm">El borrador está listo para editar y publicar.</p>
                    <button
                      onClick={handleVerBorrador}
                      className="mt-2 bg-gold text-navy text-xs font-black uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors"
                    >
                      Ver borrador →
                    </button>
                  </div>
                ) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gold text-navy shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3">
              <Loader2 size={16} className="text-gold animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe el artículo que quieres crear..."
            rows={2}
            className="flex-1 bg-white/5 border border-white/20 text-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-gold transition-colors placeholder-white/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-gold text-navy px-4 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-white/20 text-[10px] mt-2 font-black uppercase tracking-widest">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}
