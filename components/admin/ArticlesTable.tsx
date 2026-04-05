'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Article } from '@/lib/articles'
import { Edit, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from './Toast'

interface Props {
  articles: Article[]
}

const CATEGORIES = ['TODAS', 'NOTICIAS', 'SEDES', 'MARKETING', 'ANÁLISIS']

export default function ArticlesTable({ articles }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('TODAS')

  const filtered = activeCategory === 'TODAS'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

  async function handleTogglePublish(id: number, currentStatus: 0 | 1) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/articles/${id}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al cambiar estado')
      const data = await res.json()
      toast('success', data.published === 1 ? 'Artículo publicado ✓' : 'Artículo guardado como borrador')
      router.refresh()
    } catch {
      toast('error', 'No se pudo cambiar el estado del artículo')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast('success', 'Artículo eliminado')
      router.refresh()
    } catch {
      toast('error', 'No se pudo eliminar el artículo')
    } finally {
      setLoadingId(null)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-12 text-center">
        <p className="text-white/40 text-sm font-black uppercase tracking-widest">No hay artículos todavía</p>
        <Link href="/admin/articles/new" className="mt-4 inline-block text-gold font-black text-sm hover:underline">
          Crear el primero →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              activeCategory === cat
                ? 'bg-gold text-navy'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat} {cat === 'TODAS' ? `(${articles.length})` : `(${articles.filter(a => a.category === cat).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm font-black uppercase tracking-widest py-8">Sin artículos en esta categoría</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[10px] font-black tracking-widest uppercase text-white/30 pb-4 pr-4">Título</th>
                <th className="text-left text-[10px] font-black tracking-widest uppercase text-white/30 pb-4 pr-4 hidden md:table-cell">Categoría</th>
                <th className="text-left text-[10px] font-black tracking-widest uppercase text-white/30 pb-4 pr-4 hidden lg:table-cell">Fecha</th>
                <th className="text-left text-[10px] font-black tracking-widest uppercase text-white/30 pb-4 pr-4">Estado</th>
                <th className="text-right text-[10px] font-black tracking-widest uppercase text-white/30 pb-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((article) => {
                const isLoading = loadingId === article.id
                return (
                  <tr key={article.id} className={`group hover:bg-white/5 transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                    <td className="py-4 pr-4">
                      <div className="font-black text-white text-sm leading-tight max-w-xs truncate">{article.title}</div>
                      <div className="text-white/30 text-xs mt-1 font-mono truncate max-w-xs">{article.slug}</div>
                    </td>
                    <td className="py-4 pr-4 hidden md:table-cell">
                      <span className="bg-white/10 text-white/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4 hidden lg:table-cell">
                      <time className="text-white/40 text-xs font-black">
                        {new Date(article.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </time>
                    </td>
                    <td className="py-4 pr-4">
                      <button
                        onClick={() => handleTogglePublish(article.id, article.published)}
                        disabled={isLoading}
                        aria-label={article.published === 1 ? 'Despublicar artículo' : 'Publicar artículo'}
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 transition-colors disabled:cursor-not-allowed ${
                          article.published === 1
                            ? 'text-green-400 hover:text-red-400'
                            : 'text-white/30 hover:text-gold'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : article.published === 1 ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {article.published === 1 ? 'Publicado' : 'Borrador'}
                      </button>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {article.published === 1 && (
                          <Link
                            href={`/noticias/${article.slug}`}
                            target="_blank"
                            aria-label="Ver artículo publicado"
                            className="p-2 text-white/30 hover:text-gold transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${article.id}`}
                          aria-label="Editar artículo"
                          className="p-2 text-white/30 hover:text-white transition-colors"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={isLoading}
                          aria-label="Eliminar artículo"
                          className="p-2 text-white/30 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                        >
                          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
