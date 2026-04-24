'use client'

import { useState, useEffect, useCallback } from 'react'
import AIChat from '@/components/admin/AIChat'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { Sparkles, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'

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

const DRAFT_KEY = 'prime-new-article-draft'
const CHAT_KEY = 'prime-new-article-chat'

const EMPTY_DRAFT: ArticleDraft = {
  slug: '',
  title: '',
  meta_title: '',
  meta_desc: '',
  keywords: '',
  category: 'NOTICIAS',
  content: '',
  image_url: null,
  image_alt: null,
  author: 'Jorge Rodríguez',
}

export default function NewArticlePage() {
  const [draft, setDraft] = useState<ArticleDraft>(EMPTY_DRAFT)
  const [aiOpen, setAiOpen] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [aiChatKey, setAiChatKey] = useState(0)

  // Load persisted draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setDraft(JSON.parse(saved))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  const handleDraftChange = useCallback((updated: ArticleDraft) => {
    setDraft(updated)
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
  }, [])

  function handleArticleReady(article: ArticleDraft) {
    handleDraftChange(article)
  }

  // Clear localStorage once the article has been persisted — prevents the
  // previous draft from re-appearing the next time the user opens "Nuevo artículo".
  function clearPersistedDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(CHAT_KEY)
    } catch { /* ignore */ }
  }

  function handleStartOver() {
    // Only prompt if there's something worth losing — an empty draft with no
    // chat history shouldn't require a confirm dialog.
    const hasWork = draft.title.trim() || draft.content.trim()
    if (hasWork && !confirm('¿Empezar de nuevo? Se borrará el artículo actual y el chat.')) return
    setDraft(EMPTY_DRAFT)
    clearPersistedDraft()
    // Force AIChat to reset by re-mounting it
    setAiChatKey((k) => k + 1)
  }

  // Draft is "unsaved" whenever it exists in localStorage but hasn't been
  // persisted to the DB yet — make this visible so a stuck draft doesn't look
  // like a broken system.
  const draftIsUnsaved = Boolean(draft.title.trim() || draft.content.trim())

  if (!hydrated) return null

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="font-display font-black italic text-white text-3xl mb-0.5">
            NUEVO <span className="text-gold">ARTÍCULO</span>
          </h1>
          <p className="text-white/30 text-[10px] font-black tracking-widest uppercase">
            Editor híbrido · IA integrada
            {draftIsUnsaved && (
              <span className="ml-3 text-yellow-400">· Borrador sin guardar (solo en este navegador)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/30 text-xs font-black uppercase tracking-widest hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={13} />
            Empezar de nuevo
          </button>
          <button
            onClick={() => setAiOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/50 text-xs font-black uppercase tracking-widest hover:border-gold hover:text-gold transition-colors"
          >
            <Sparkles size={13} />
            IA
            {aiOpen ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </div>

      {/* Hybrid layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Editor — always visible, grows to fill space */}
        <div className={`flex flex-col overflow-y-auto transition-all duration-200 ${aiOpen ? 'w-full lg:w-[58%]' : 'w-full'}`}>
          <ArticleEditor
            draft={draft}
            onChange={handleDraftChange}
            onSaveSuccess={clearPersistedDraft}
            onPublishSuccess={clearPersistedDraft}
            mode="new"
          />
        </div>

        {/* AI sidebar */}
        {aiOpen && (
          <div className="w-full lg:w-[42%] bg-white/5 border border-white/10 p-5 flex flex-col overflow-hidden lg:shrink-0">
            <AIChat
              key={aiChatKey}
              onArticleReady={handleArticleReady}
              currentDraft={draft}
              storageKey={CHAT_KEY}
            />
          </div>
        )}
      </div>
    </div>
  )
}
