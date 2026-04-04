import { notFound } from 'next/navigation'
import { getArticleById } from '@/lib/articles'
import ArticleEditor from '@/components/admin/ArticleEditor'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const article = getArticleById(Number(id))
  if (!article) notFound()

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles" className="text-white/30 hover:text-gold text-xs font-black uppercase tracking-widest transition-colors">
          ← Artículos
        </Link>
        <span className="text-white/10">|</span>
        <h1 className="font-display font-black italic text-white text-2xl truncate">
          {article.title}
        </h1>
      </div>

      <ArticleEditor
        initialDraft={article}
        articleId={article.id}
        mode="edit"
      />
    </div>
  )
}
