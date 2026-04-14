'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Wand2 } from 'lucide-react'

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
  currentDraft?: ArticleDraft
  storageKey?: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: '¡Hola Jorge! Puedo generar un artículo nuevo o pulir el que estás escribiendo. ¿Qué hacemos?',
}

const STARTER_PROMPTS = [
  'Escríbeme un artículo sobre la selección de México en el Mundial 2026',
  'Crea un artículo de marketing sobre cómo anunciarse en el Mundial',
  'Quiero un análisis de los grupos del Mundial 2026',
  'Artículo sobre las sedes del Mundial en Estados Unidos',
]

/** Mirror of server-side sanitizer — fix literal newlines in JSON strings */
function sanitizeJsonString(str: string): string {
  let result = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (escaped) { result += ch; escaped = false; continue }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue }
    if (ch === '"') { result += ch; inString = !inString; continue }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
    }
    result += ch
  }
  return result
}

function tryExtractArticle(text: string): ArticleDraft | null {
  let searchText = text
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) searchText = fenceMatch[1].trim()
  const jsonStart = searchText.indexOf('{')
  const jsonEnd = searchText.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null
  const rawJson = searchText.slice(jsonStart, jsonEnd + 1)
  for (const attempt of [rawJson, sanitizeJsonString(rawJson)]) {
    try {
      const parsed = JSON.parse(attempt)
      if (parsed.slug && parsed.title && parsed.content) return parsed as ArticleDraft
    } catch { /* continue */ }
  }
  return null
}

export default function AIChat({ onArticleReady, currentDraft, storageKey = 'prime-article-chat' }: Props) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastArticle, setLastArticle] = useState<ArticleDraft | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Restore chat + lastArticle from localStorage on mount
  useEffect(() => {
    try {
      const savedChat = localStorage.getItem(storageKey)
      if (savedChat) {
        const parsed = JSON.parse(savedChat)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          // Re-extract lastArticle from the most recent assistant message that has JSON
          for (let i = parsed.length - 1; i >= 0; i--) {
            if (parsed[i].role === 'assistant') {
              const extracted = tryExtractArticle(parsed[i].content)
              if (extracted) { setLastArticle(extracted); break }
            }
          }
        }
      }
    } catch { /* ignore */ }
  }, [storageKey])

  // Persist chat to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch { /* ignore */ }
  }, [messages, storageKey])

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

      // Server already extracted, or try client-side extraction as fallback
      const article = data.article ?? tryExtractArticle(data.text)
      if (article) {
        setLastArticle(article)
        onArticleReady(article)
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  function handlePolish() {
    if (!currentDraft?.content?.trim()) return
    const polishPrompt = `Por favor pule y mejora este artículo que ya tengo escrito. Mantén el mismo tema y tono, pero mejora: la estructura, el SEO, la fluidez del español, y asegúrate de que quede entre 800-1500 palabras. Devuelve el artículo completo en el formato JSON habitual.

Título actual: ${currentDraft.title}
Contenido actual:
${currentDraft.content}`
    sendMessage(polishPrompt)
  }

  function handleApplyDraft() {
    if (lastArticle) onArticleReady(lastArticle)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE])
    setLastArticle(null)
    try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-gold" />
          <span className="text-xs font-black uppercase tracking-widest text-white/60">Asistente IA</span>
        </div>
        <div className="flex items-center gap-2">
          {currentDraft?.content && (
            <button
              onClick={handlePolish}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-colors disabled:opacity-40"
            >
              <Wand2 size={10} />
              Pulir artículo
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[11px] bg-white/5 border border-white/20 text-white/60 px-3 py-2 hover:bg-gold/10 hover:border-gold hover:text-gold transition-colors font-black text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-gold text-navy' : 'bg-white/10 text-white'}`}>
              {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
            </div>
            <div className={`max-w-[86%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white/5 border border-white/10 text-white/80'
                  : 'bg-gold/10 border border-gold/30 text-white'
              }`}>
                {msg.role === 'assistant' && msg.content.includes('"slug"') && msg.content.includes('"content"') ? (
                  <div className="space-y-2">
                    {lastArticle ? (
                      <>
                        <p className="text-green-400 font-black text-[11px] uppercase tracking-widest">✓ Artículo listo</p>
                        <p className="text-white/60 text-xs">Aplicado al editor. Edita los campos y publica cuando estés listo.</p>
                        <button
                          onClick={handleApplyDraft}
                          className="mt-1 bg-gold text-navy text-[11px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-white transition-colors"
                        >
                          Aplicar al editor →
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-yellow-400 font-black text-[11px] uppercase tracking-widest">⚠ JSON no pudo parsearse</p>
                        <p className="text-white/60 text-xs">Pide al asistente que reintente o regenere el artículo.</p>
                      </>
                    )}
                  </div>
                ) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 flex items-center justify-center bg-gold text-navy shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-2.5">
              <Loader2 size={14} className="text-gold animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 pt-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pide un artículo o mejoras..."
            rows={2}
            className="flex-1 bg-white/5 border border-white/20 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:border-gold transition-colors placeholder-white/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-gold text-navy px-3 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-white/20 text-[10px] mt-1.5 font-black uppercase tracking-widest">Enter envía · Shift+Enter nueva línea</p>
      </div>
    </div>
  )
}
