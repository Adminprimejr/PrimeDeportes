import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getArticleBySlug, getPublishedArticles } from '@/lib/articles'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = getPublishedArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'

  return {
    title: article.meta_title,
    description: article.meta_desc,
    keywords: article.keywords,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.meta_title,
      description: article.meta_desc,
      type: 'article',
      publishedTime: article.created_at,
      authors: [article.author],
      images: article.image_url ? [{ url: article.image_url, alt: article.image_alt || article.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title,
      description: article.meta_desc,
      images: article.image_url ? [article.image_url] : [],
    },
    alternates: {
      canonical: `${siteUrl}/noticias/${slug}`,
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.meta_desc,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Prime Deportes',
      url: siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/noticias/${slug}` },
    ...(article.image_url && {
      image: { '@type': 'ImageObject', url: article.image_url, description: article.image_alt },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-navy-dark pt-28">
        {/* Hero image */}
        {article.image_url && (
          <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.image_alt || article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-6 max-w-4xl pb-40">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/40 font-black tracking-widest uppercase mb-8 mt-10">
            <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/noticias" className="hover:text-gold transition-colors">Noticias</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Category + date */}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gold text-navy px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {article.category}
            </span>
            <time className="text-gold font-black text-[10px] tracking-widest">{formatDate(article.created_at)}</time>
          </div>

          {/* Title */}
          <h1 className="font-display font-black italic text-white leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {article.title}
          </h1>

          {/* Author */}
          <p className="text-white/50 text-sm font-black tracking-widest uppercase mb-12 pb-12 border-b border-white/10">
            Por {article.author}
          </p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none
            prose-headings:font-display prose-headings:italic prose-headings:font-black prose-headings:text-white
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-gold prose-h2:pl-6
            prose-h3:text-xl prose-h3:text-gold
            prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:text-white prose-strong:font-black
            prose-ul:text-white/80 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:text-white/60 prose-blockquote:italic
            prose-a:text-gold prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>

          {/* Back link */}
          <div className="mt-20 pt-12 border-t border-white/10">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-gold font-black text-sm tracking-widest uppercase hover:underline"
            >
              ← Ver todos los artículos
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
