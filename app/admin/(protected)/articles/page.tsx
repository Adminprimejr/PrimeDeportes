import Link from 'next/link'
import { getAllArticles } from '@/lib/articles'
import ArticlesTable from '@/components/admin/ArticlesTable'

export default async function ArticlesListPage() {
  const articles = await getAllArticles()

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-black italic text-white text-4xl mb-1">
            ARTÍCULOS
          </h1>
          <p className="text-white/40 text-xs font-black tracking-widest uppercase">{articles.length} artículos en total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-gold text-navy font-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-white transition-colors"
        >
          + Nuevo artículo
        </Link>
      </div>

      <ArticlesTable articles={articles} />
    </div>
  )
}
