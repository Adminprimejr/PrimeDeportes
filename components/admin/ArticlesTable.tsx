'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Article } from '@/lib/articles'
import { Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface Props {
  articles: Article[]
}

export default function ArticlesTable({ articles }: Props) {
  const router = useRouter()

  async function handleTogglePublish(id: number) {
    await fetch(`/api/admin/articles/${id}/publish`, { method: 'POST' })
    router.refresh()
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    router.refresh()
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
          {articles.map((article) => (
            <tr key={article.id} className="group hover:bg-white/5 transition-colors">
              <td className="py-4 pr-4">
                <div className="font-black text-white text-sm leading-tight max-w-xs truncate">{article.title}</div>
                <div className="text-white/30 text-xs mt-1 font-mono">{article.slug}</div>
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
                  onClick={() => handleTogglePublish(article.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 transition-colors ${
                    article.published === 1
                      ? 'text-green-400 hover:text-red-400'
                      : 'text-white/30 hover:text-gold'
                  }`}
                  title={article.published === 1 ? 'Click para despublicar' : 'Click para publicar'}
                >
                  {article.published === 1 ? <Eye size={12} /> : <EyeOff size={12} />}
                  {article.published === 1 ? 'Publicado' : 'Borrador'}
                </button>
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2">
                  {article.published === 1 && (
                    <Link
                      href={`/noticias/${article.slug}`}
                      target="_blank"
                      className="p-2 text-white/30 hover:text-gold transition-colors"
                      title="Ver artículo"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="p-2 text-white/30 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
