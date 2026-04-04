'use client'

import { useState } from 'react'
import AIChat from '@/components/admin/AIChat'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { Sparkles, PenLine } from 'lucide-react'

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

type Tab = 'ai' | 'manual'

export default function NewArticlePage() {
  const [tab, setTab] = useState<Tab>('ai')
  const [draft, setDraft] = useState<Partial<ArticleDraft>>({})
  const [hasDraft, setHasDraft] = useState(false)

  function handleArticleReady(article: ArticleDraft) {
    setDraft(article)
    setHasDraft(true)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-black italic text-white text-4xl mb-1">
          NUEVO <span className="text-gold">ARTÍCULO</span>
        </h1>
        <p className="text-white/40 text-xs font-black tracking-widest uppercase">Asistente de IA con SEO integrado</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab('ai')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
            tab === 'ai' ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          Crear con IA
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
            tab === 'manual' ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          <PenLine size={14} />
          Escribir manual
          {hasDraft && <span className="bg-green-400 text-navy text-[9px] px-1.5 py-0.5 rounded-full font-black ml-1">BORRADOR</span>}
        </button>
      </div>

      {tab === 'ai' ? (
        <div className="grid lg:grid-cols-2 gap-8 h-[70vh]">
          {/* Chat panel */}
          <div className="bg-white/5 border border-white/10 p-6 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <Sparkles size={16} className="text-gold" />
              <span className="text-xs font-black uppercase tracking-widest text-white/60">Asistente Editorial IA</span>
            </div>
            <AIChat onArticleReady={(article) => { handleArticleReady(article); setTab('manual') }} />
          </div>

          {/* Instructions panel */}
          <div className="bg-white/3 border border-white/5 p-6">
            <h3 className="text-gold font-black text-sm uppercase tracking-widest mb-4">¿Cómo funciona?</h3>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Dile al asistente sobre qué quieres escribir. Puedes dar el tema, el ángulo, el público objetivo.' },
                { step: '2', text: 'El asistente creará un artículo completo optimizado para SEO con título, meta descripción y palabras clave.' },
                { step: '3', text: 'El artículo aparecerá en la pestaña "Escribir manual" donde puedes editar cualquier campo.' },
                { step: '4', text: 'Haz clic en "Publicar" para publicarlo en el sitio, o "Guardar borrador" para editarlo más tarde.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex gap-3">
                  <span className="w-6 h-6 bg-gold text-navy font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                  <p className="text-white/50 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 p-4 bg-gold/5 border border-gold/20">
              <p className="text-gold text-xs font-black uppercase tracking-widest mb-2">Sugerencias de temas</p>
              <ul className="space-y-1">
                {[
                  'Noticias de equipos y jugadores',
                  'Análisis de grupos y partidos',
                  'Guías de sedes y fan zones',
                  'Estrategias de marketing para el Mundial',
                  'Oportunidades para anunciantes hispanos',
                ].map((t) => (
                  <li key={t} className="text-white/40 text-xs font-black">· {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <ArticleEditor initialDraft={draft} mode="new" />
      )}
    </div>
  )
}
