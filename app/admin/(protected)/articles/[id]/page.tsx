import { notFound } from 'next/navigation'
import { getArticleById } from '@/lib/articles'
import EditArticleLayout from '@/components/admin/EditArticleLayout'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const article = getArticleById(Number(id))
  if (!article) notFound()

  return <EditArticleLayout article={article} />
}
