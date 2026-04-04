import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://primedeportes.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Prime Deportes | Publicidad Mundial 2026 — Llega al Mercado Hispano',
    template: '%s | Prime Deportes',
  },
  description:
    'La plataforma de medios deportivos más influyente del mercado hispano. Conecta tu marca con millones de fanáticos del fútbol durante el Mundial 2026. Cobertura total en las 16 sedes.',
  keywords: [
    'publicidad Copa del Mundo 2026',
    'publicidad Mundial 2026',
    'mercado hispano Mundial 2026',
    'anunciar durante el mundial',
    'medios deportivos en español',
    'prime deportes publicidad',
    'sponsor World Cup 2026 Hispanic',
    'advertising World Cup 2026 US Hispanic',
  ],
  authors: [{ name: 'Jorge Rodríguez', url: BASE_URL }],
  creator: 'Prime Deportes',
  publisher: 'Prime Deportes',
  openGraph: {
    type: 'website',
    locale: 'es_US',
    alternateLocale: ['es_CO', 'en_US'],
    url: BASE_URL,
    siteName: 'Prime Deportes',
    title: 'Prime Deportes | Publicidad Mundial 2026',
    description:
      'Conecta tu marca con millones de fanáticos hispanos del fútbol. Cobertura total en las 16 sedes del Mundial 2026.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prime Deportes — Publicidad Mundial 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prime Deportes | Publicidad Mundial 2026',
    description: 'La plataforma de medios más influyente del deporte hispano. Tu marca en el Mundial.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NewsMediaOrganization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Prime Deportes',
      description:
        'La plataforma de medios deportivos más influyente del mercado hispano. Cobertura total del Mundial 2026 en las 16 sedes.',
      url: BASE_URL,
      telephone: '+17373512340',
      email: 'journalist@primedeportes.com',
      foundingDate: '2011',
      areaServed: [
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'Colombia' },
      ],
      sameAs: [
        'https://instagram.com/primedeportes',
        'https://youtube.com/primedeportes',
        'https://twitter.com/primedeportes',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Prime Deportes',
      inLanguage: 'es',
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuántos cupos publicitarios quedan para el Mundial 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los cupos para el paquete Live Experience están prácticamente agotados. Quedan disponibilidad limitada en Multimedia Pro y Digital Total. El cierre de ventas es el 1 de junio de 2026.',
          },
        },
        {
          '@type': 'Question',
          name: '¿En qué ciudades tiene cobertura Prime Deportes durante el Mundial?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cubrimos Miami, Dallas, Los Ángeles y Nueva York — los 4 principales mercados hispanos de EE.UU. Más cobertura digital nacional e internacional desde Colombia.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo se miden los resultados de una campaña con Prime Deportes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Entregamos reportes semanales con: impresiones verificadas, alcance, Video Completion Rate (VCR), métricas de engagement y tráfico referido. Los paquetes Multimedia Pro y Live Experience incluyen Brand Lift Study.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
