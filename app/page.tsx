import HomeContent from '@/components/HomeContent'
import { getPublishedArticles } from '@/lib/articles'
import type { Article } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // Never let a DB hiccup (missing Supabase creds, unmigrated tables, transient
  // outage) take down the marketing home page — fall back to an empty list.
  let articles: Article[] = []
  try {
    articles = await getPublishedArticles(3)
  } catch (err) {
    console.error('[home] getPublishedArticles failed:', err)
  }
  return <HomeContent articles={articles} />
}
