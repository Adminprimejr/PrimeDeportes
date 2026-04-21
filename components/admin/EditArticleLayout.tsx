'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ChevronRight, ChevronLeft, Trash2, Loader2 } from 'lucide-react'
import ArticleEditor from './ArticleEditor'
import AIChat from './AIChat'
import { toast } from './Toast'
import type { Article } from '@/lib/articles'

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
  article: Article
}

export default function EditArticleLayout({ article }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<ArticleDraft>({
    slug: article.slug,
    title: article.title,
    meta_title: article.meta_title,
    meta_desc: article.meta_desc,
    keywords: article.keywords,
    category: article.category,
    content: article.content,
    image_url: article.image_url,
    image_alt: article.image_alt,
    author: article.author,
  })
  const [aiOpen, setAiOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleArticleReady(newDraft: ArticleDraft) {
    // Merge AI-generated content into current editor, keeping the article ID
    setDraft(newDraft)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${article.title}"?\nEsta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast('success', 'Artículo eliminado')
      router.push('/admin/articles')
    } catch {
      toast('error', 'No se pudo eliminar el artículo')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/articles"
            className="text-white/30 hover:text-gold text-xs font-black uppercase tracking-widest transition-colors shrink-0"
          >
            ← Artículos
          </Link>
          <span className="text-white/10 shrink-0">|</span>
          <h1 className="font-display font-black italic text-white text-xl truncate">
            {article.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/30 text-xs font-black uppercase tracking-widest hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>

          {/* AI toggle */}
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
        {/* Editor */}
        <div className={`flex flex-col overflow-y-auto transition-all duration-200 ${aiOpen ? 'w-full lg:w-[58%]' : 'w-full'}`}>
          <ArticleEditor
            draft={draft}
            onChange={setDraft}
            articleId={article.id}
            currentPublished={article.published}
            mode="edit"
          />
        </div>

        {/* AI sidebar */}
        {aiOpen && (
          <div className="w-full lg:w-[42%] bg-white/5 border border-white/10 p-5 flex flex-col overflow-hidden lg:shrink-0">
            <div className="mb-3 pb-3 border-b border-white/10 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                ⚡ Modo edición — el AI puede reemplazar el artículo completo
              </p>
            </div>
            <AIChat
              onArticleReady={handleArticleReady}
              currentDraft={draft}
              storageKey={`prime-edit-chat-${article.id}`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
