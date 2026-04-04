import HomeContent from '@/components/HomeContent'
import { getPublishedArticles } from '@/lib/articles'
import type { Article } from '@/lib/articles'

export default function Page() {
  const articles: Article[] = getPublishedArticles(3)
  return <HomeContent articles={articles} />
}
