'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, Code, Save, Send, CheckCircle, AlertCircle } from 'lucide-react'
import ImagePicker from './ImagePicker'

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
  // Controlled mode (new page with AI): pass both
  draft?: ArticleDraft
  onChange?: (d: ArticleDraft) => void
  onSaveSuccess?: () => void
  onPublishSuccess?: () => void
  // Uncontrolled mode (edit existing article): pass this
  initialDraft?: Partial<ArticleDraft>
  articleId?: number
  // Current published state (edit mode only) — so "Guardar borrador" doesn't
  // silently flip a live article back to draft.
  currentPublished?: 0 | 1
  mode: 'new' | 'edit'
}

const EMPTY: ArticleDraft = {
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

const CATEGORIES = ['NOTICIAS', 'SEDES', 'MARKETING', 'ANÁLISIS']

function SEOHint({ label, value, max, min = 0 }: { label: string; value: string; max: number; min?: number }) {
  const len = value.length
  const ok = len >= min && len <= max
  const warn = len > max
  return (
    <div className="flex items-center gap-2 mt-1">
      {warn ? (
        <AlertCircle size={12} className="text-red-400 shrink-0" />
      ) : ok && len > 0 ? (
        <CheckCircle size={12} className="text-green-400 shrink-0" />
      ) : (
        <div className="w-3 h-3 shrink-0" />
      )}
      <span className={`text-[10px] font-black ${warn ? 'text-red-400' : ok && len > 0 ? 'text-green-400' : 'text-white/20'}`}>
        {len}/{max} caracteres {label}
      </span>
    </div>
  )
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80)
}

export default function ArticleEditor({ draft: controlledDraft, onChange, onSaveSuccess, onPublishSuccess, initialDraft, articleId, currentPublished = 0, mode }: Props) {
  const router = useRouter()
  const isControlled = controlledDraft !== undefined && onChange !== undefined
  const [internalDraft, setInternalDraft] = useState<ArticleDraft>({ ...EMPTY, ...initialDraft })
  const draft = isControlled ? controlledDraft : internalDraft
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof ArticleDraft, value: string | null) {
    const updated = { ...draft, [field]: value }
    if (field === 'title' && typeof value === 'string') {
      updated.slug = generateSlug(value)
      if (!updated.meta_title) updated.meta_title = value.substring(0, 55) + ' | Prime Deportes'
    }
    if (isControlled) {
      onChange(updated)
    } else {
      setInternalDraft(updated)
    }
    setSaved(false)
  }

  async function saveArticle(publish: boolean | null): Promise<number | null> {
    setSaving(true)
    setErrorMsg('')
    try {
      // publish = true  → force published=1
      // publish = false → force published=0 (only used by explicit "unpublish" paths, which we don't have here)
      // publish = null  → preserve current state (new articles default to draft, existing keeps its flag)
      const resolvedPublished: 0 | 1 =
        publish === true ? 1 : publish === false ? 0 : mode === 'new' ? 0 : currentPublished
      const payload = { ...draft, published: resolvedPublished }
      let id = articleId
      if (mode === 'new') {
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          setErrorMsg(data.error || 'Error al guardar el artículo')
          return null
        }
        const created = await res.json()
        id = created.id
      } else {
        const res = await fetch(`/api/admin/articles/${articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          setErrorMsg(data.error || 'Error al guardar el artículo')
          return null
        }
      }
      setSaved(true)
      return id ?? null
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    const id = await saveArticle(null)
    if (id) {
      onSaveSuccess?.()
      if (mode === 'new') router.push(`/admin/articles/${id}`)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    const id = await saveArticle(true)
    setPublishing(false)
    if (id) {
      onPublishSuccess?.()
      router.push('/admin/articles')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(false)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              !preview ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Code size={14} /> Editor
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              preview ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>
        <div className="flex items-center gap-3">
          {errorMsg && <span className="text-red-400 text-xs font-black flex items-center gap-1"><AlertCircle size={12} /> {errorMsg}</span>}
          {saved && !errorMsg && <span className="text-green-400 text-xs font-black flex items-center gap-1"><CheckCircle size={12} /> Guardado</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || !draft.title || !draft.content}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-navy text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30"
          >
            <Send size={14} />
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {preview ? (
        /* Preview mode — uses the same .article-body styles as the published page */
        <div className="bg-white/5 border border-white/10 p-8">
          <div className="max-w-3xl">
            <div className="mb-2">
              <span className="bg-gold text-navy px-2 py-0.5 text-[10px] font-black uppercase">{draft.category}</span>
            </div>
            <h1 className="font-display font-black italic text-white text-4xl leading-tight mb-4">{draft.title || 'Sin título'}</h1>
            <p className="text-white/50 text-sm mb-8 pb-8 border-b border-white/10">Por {draft.author}</p>
            <div className="article-body max-w-none text-white/80 [&_h2]:font-display [&_h2]:italic [&_h2]:font-black [&_h2]:text-white [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:italic [&_h3]:font-black [&_h3]:text-gold [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-relaxed [&_p]:mb-6 [&_a]:text-gold hover:[&_a]:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content || '*Sin contenido*'}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">Título del artículo *</label>
            <input
              value={draft.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ej: Las 16 Sedes del Mundial 2026: Guía Completa"
              className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors font-black text-lg placeholder-white/20"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Slug */}
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">URL (slug)</label>
              <input
                value={draft.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder="las-16-sedes-del-mundial-2026"
                className="w-full bg-white/5 border border-white/20 text-white/70 px-4 py-3 focus:outline-none focus:border-gold transition-colors font-mono text-sm placeholder-white/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">Categoría</label>
              <select
                value={draft.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors font-black"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">
              Meta título SEO <span className="text-gold">↑ Aparece en Google</span>
            </label>
            <input
              value={draft.meta_title}
              onChange={(e) => update('meta_title', e.target.value)}
              placeholder="Título SEO · máx 60 caracteres"
              className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder-white/20"
            />
            <SEOHint label="(ideal: 50-60)" value={draft.meta_title} min={50} max={60} />
          </div>

          {/* SEO Desc */}
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">
              Meta descripción <span className="text-gold">↑ Aparece en Google</span>
            </label>
            <textarea
              value={draft.meta_desc}
              onChange={(e) => update('meta_desc', e.target.value)}
              placeholder="Descripción corta que aparece en resultados de búsqueda..."
              rows={2}
              className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none placeholder-white/20"
            />
            <SEOHint label="(ideal: 120-155)" value={draft.meta_desc} min={120} max={155} />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">
              Palabras clave (separadas por comas)
            </label>
            <input
              value={draft.keywords}
              onChange={(e) => update('keywords', e.target.value)}
              placeholder="mundial 2026, sedes mundial, fifa world cup 2026..."
              className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder-white/20"
            />
          </div>

          {/* Image picker */}
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">
              Imagen del artículo <span className="text-gold">↑ Galería o URL personalizada</span>
            </label>
            <ImagePicker
              value={draft.image_url}
              alt={draft.image_alt}
              category={draft.category}
              onSelect={(url, alt) => {
                // Atomic update — both fields in one call to avoid stale draft
                const updated = { ...draft, image_url: url, image_alt: alt }
                if (isControlled) { onChange(updated) } else { setInternalDraft(updated) }
                setSaved(false)
              }}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-black tracking-widest uppercase text-white/40">
                Contenido (Markdown) *
              </label>
              <span className="text-[10px] text-white/20 font-black">
                {draft.content.split(/\s+/).filter(Boolean).length} palabras
                {draft.content.split(/\s+/).filter(Boolean).length < 600
                  ? ' · ' : ' · '}
                <span className={draft.content.split(/\s+/).filter(Boolean).length >= 600 ? 'text-green-400' : 'text-yellow-400'}>
                  {draft.content.split(/\s+/).filter(Boolean).length >= 600 ? '✓ buen largo' : 'mín. recomendado: 600'}
                </span>
              </span>
            </div>
            <textarea
              value={draft.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="## Introducción&#10;&#10;Escribe el contenido en Markdown...&#10;&#10;## Sección 2&#10;&#10;### Subsección"
              rows={20}
              className="w-full bg-white/5 border border-white/20 text-white/80 px-4 py-3 focus:outline-none focus:border-gold transition-colors font-mono text-sm resize-y placeholder-white/20 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  )
}
