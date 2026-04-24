import type { MetadataRoute } from 'next'
import { getPublishedArticles } from '@/lib/articles'

// Sitemap queries Supabase — generate on request, not at build time.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = []
  try {
    articles = await getPublishedArticles()
  } catch (err) {
    console.error('[sitemap] getPublishedArticles failed:', err)
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...articles.map((a) => ({
      url: `${baseUrl}/noticias/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
