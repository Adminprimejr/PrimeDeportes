import HomeContent from '@/components/HomeContent'
import { getPublishedArticles } from '@/lib/articles'
import type { Article } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const articles: Article[] = await getPublishedArticles(3)
  return <HomeContent articles={articles} />
}
