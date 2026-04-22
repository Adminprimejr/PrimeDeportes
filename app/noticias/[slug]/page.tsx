import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getArticleBySlug } from '@/lib/articles'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/SiteFooter'
import AuthorBio from '@/components/AuthorBio'

interface Props {
  params: Promise<{ slug: string }>
}

// Admin-published articles need to appear immediately, not only on next rebuild.
// Dropping generateStaticParams and forcing dynamic rendering is the simplest
// way to make new slugs resolvable without a redeploy.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'

  return {
    title: article.meta_title,
    description: article.meta_desc,
    keywords: article.keywords,
    authors: [{ name: article.author, url: `${siteUrl}/noticias` }],
    openGraph: {
      title: article.meta_title,
      description: article.meta_desc,
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author],
      siteName: 'Prime Deportes',
      images: article.image_url ? [{ url: article.image_url, width: 1200, height: 630, alt: article.image_alt || article.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title,
      description: article.meta_desc,
      images: article.image_url ? [article.image_url] : [],
      creator: '@primedeportes',
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
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'
  const articleUrl = `${siteUrl}/noticias/${slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Noticias', item: `${siteUrl}/noticias` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#jorge-rodriguez`,
    name: 'Jorge Rodríguez',
    jobTitle: 'Director General',
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: 'Prime Deportes',
      url: siteUrl,
    },
    description: 'Periodista deportivo con más de 15 años cubriendo el fútbol latinoamericano en Estados Unidos y Colombia. Director General de Prime Deportes.',
    image: `${siteUrl}/jorge.jpg`,
    sameAs: [
      'https://instagram.com/primedeportes',
      'https://youtube.com/primedeportes',
    ],
    knowsAbout: ['Fútbol', 'Copa del Mundo 2026', 'Mercado hispano', 'Medios deportivos', 'Marketing deportivo'],
    url: `${siteUrl}/noticias`,
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.meta_desc,
    keywords: article.keywords,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    url: articleUrl,
    author: { '@id': `${siteUrl}/#jorge-rodriguez` },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Prime Deportes',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.jpg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    inLanguage: 'es',
    ...(article.image_url && {
      image: {
        '@type': 'ImageObject',
        url: article.image_url,
        description: article.image_alt || article.title,
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-28">
        {/* Hero image */}
        {article.image_url && (
          <div className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
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

        <div className="container mx-auto px-6 max-w-4xl pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 font-black tracking-widest uppercase mb-8 mt-10">
            <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/noticias" className="hover:text-gold transition-colors">Noticias</Link>
            <span>/</span>
            <span className="text-white/50 truncate max-w-[200px]">{article.category}</span>
          </nav>

          {/* Category + date */}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gold text-navy px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {article.category}
            </span>
            <time dateTime={article.created_at} className="text-gold font-black text-[10px] tracking-widest">
              {formatDate(article.created_at)}
            </time>
          </div>

          {/* Title */}
          <h1 className="font-display font-black italic text-white leading-none mb-6" style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)' }}>
            {article.title}
          </h1>

          {/* Author line */}
          <div className="flex items-center gap-3 mb-12 pb-12 border-b border-white/10">
            <div className="relative w-10 h-10 overflow-hidden border border-gold/50 shrink-0">
              <Image src="/jorge.jpg" alt="Jorge Rodríguez" fill className="object-cover object-top" sizes="40px" />
            </div>
            <div>
              <p className="text-white text-sm font-black">Jorge Rodríguez</p>
              <p className="text-white/40 text-[10px] font-black tracking-widest uppercase">Director General · Prime Deportes</p>
            </div>
          </div>

          {/* Article content — ESPN-quality rendering */}
          <div className="article-body prose prose-invert prose-lg max-w-none
            prose-headings:font-display prose-headings:italic prose-headings:font-black prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-0 prose-h2:mb-4
            prose-h3:text-lg prose-h3:text-gold prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:font-black
            prose-ul:my-0 prose-ol:my-0 prose-li:my-0
            prose-blockquote:border-0 prose-blockquote:not-italic prose-blockquote:my-0
            prose-a:text-gold prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>

          {/* Conversion CTA */}
          <div className="mt-16 bg-gold/5 border-2 border-gold p-5 sm:p-8 md:p-10">
            <div className="text-gold font-black text-xs tracking-[0.4em] uppercase mb-3">¿LISTO PARA ANUNCIAR?</div>
            <h3 className="font-display font-black italic text-white text-2xl md:text-3xl leading-tight mb-4">
              Conecta tu marca con millones de fans hispanos durante el Mundial 2026
            </h3>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Cupos publicitarios limitados. Cierre de ventas: <strong className="text-gold">1 de junio 2026</strong>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/#packs"
                className="bg-gold text-navy font-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-white transition-colors"
              >
                Ver Paquetes
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/jorgeerodriguezserrano'}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gold text-gold font-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-gold hover:text-navy transition-colors"
              >
                Agendar Llamada Gratis
              </a>
            </div>
          </div>

          {/* Author bio */}
          <AuthorBio />

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-gold font-black text-sm tracking-widest uppercase hover:underline"
            >
              ← Ver todos los artículos
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
