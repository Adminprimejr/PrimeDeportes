import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'Noticias del Mundial 2026 | Prime Deportes',
  description: 'Cobertura editorial del Mundial 2026: sedes, grupos, análisis y oportunidades de marketing para marcas que quieren conectar con el mercado hispano.',
  openGraph: {
    title: 'Noticias del Mundial 2026 | Prime Deportes',
    description: 'Cobertura editorial del Mundial 2026: sedes, grupos, análisis y oportunidades de marketing para marcas hispanas.',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Prime Deportes Noticias — Mundial 2026' }],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  SEDES: 'bg-gold text-navy',
  MARKETING: 'bg-accent-red text-white',
  ANÁLISIS: 'bg-white text-navy',
  NOTICIAS: 'bg-white/20 text-white',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

export default function NoticiasPage() {
  const articles = getPublishedArticles(30)
  const [featured, ...rest] = articles
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Noticias del Mundial 2026 — Prime Deportes',
    description: 'Cobertura editorial del Mundial FIFA 2026',
    url: `${siteUrl}/noticias`,
    numberOfItems: articles.length,
    itemListElement: articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/noticias/${a.slug}`,
      name: a.title,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <main className="min-h-screen bg-navy-dark pt-28">
      <div className="container mx-auto px-6 pb-40">

        {/* Header */}
        <div className="mb-20">
          <div className="text-accent-red font-black tracking-[0.5em] mb-4 uppercase text-sm">PRIME DEPORTES EDITORIAL</div>
          <h1 className="font-display font-black italic text-white leading-none" style={{ fontSize: 'clamp(3rem, 10vw, 9rem)' }}>
            NOTICIAS <br /><span className="text-gold">DEL MUNDIAL</span>
          </h1>
        </div>

        {articles.length === 0 && (
          <p className="text-white/50 text-xl">No hay artículos publicados aún.</p>
        )}

        {/* Featured article */}
        {featured && (
          <Link href={`/noticias/${featured.slug}`} className="group block mb-20">
            <div className="grid lg:grid-cols-2 gap-0 border border-white/10 overflow-hidden hover:border-gold transition-colors duration-300">
              <div className="aspect-video lg:aspect-auto relative overflow-hidden">
                {featured.image_url ? (
                  <Image
                    src={featured.image_url}
                    alt={featured.image_alt || featured.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>
              <div className="p-10 lg:p-16 flex flex-col justify-center bg-navy-dark">
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${CATEGORY_COLORS[featured.category] ?? 'bg-white/20 text-white'}`}>
                    {featured.category}
                  </span>
                  <time className="text-gold font-black text-[10px] tracking-widest">{formatDate(featured.created_at)}</time>
                </div>
                <h2 className="font-display font-black italic text-3xl lg:text-5xl text-white leading-tight mb-6 group-hover:text-gold transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8">{featured.meta_desc}</p>
                <span className="text-gold font-black text-sm tracking-widest uppercase group-hover:underline">
                  Leer artículo completo →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Article grid */}
        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rest.map((article) => (
              <Link key={article.id} href={`/noticias/${article.slug}`} className="group">
                <article>
                  <div className="aspect-video overflow-hidden mb-6 relative border border-white/10 group-hover:border-gold transition-colors">
                    <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${CATEGORY_COLORS[article.category] ?? 'bg-white/20 text-white'}`}>
                      {article.category}
                    </span>
                    {article.image_url ? (
                      <Image
                        src={article.image_url}
                        alt={article.image_alt || article.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <time className="text-gold font-black text-[10px] tracking-widest block mb-2">{formatDate(article.created_at)}</time>
                  <h3 className="text-xl font-display font-black italic leading-tight text-white group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-white/50 text-sm mt-3 leading-relaxed line-clamp-2">{article.meta_desc}</p>
                </article>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
    </>
  )
}
