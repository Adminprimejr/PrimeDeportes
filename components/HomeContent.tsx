'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/lib/articles'
import {
  Trophy, Target, Globe, Smartphone, BarChart3, Mic2,
  TrendingUp, Zap, Phone, ChevronDown, Calendar, ArrowRight,
} from 'lucide-react'
import Navbar from './Navbar'
import Ticker from './Ticker'
import Countdown from './Countdown'
import StatCard from './StatCard'
import ContactForm from './ContactForm'
import ROIEstimator from './ROIEstimator'
import Testimonials from './Testimonials'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/primedeportes'

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: '¿Cuántos cupos publicitarios quedan disponibles para el Mundial 2026?',
    a: 'Los cupos para el paquete Live Experience están prácticamente agotados. Quedan disponibilidad limitada en Multimedia Pro y Digital Total. Te recomendamos contactarnos esta semana para asegurar tu espacio antes del cierre de ventas el 1 de junio.',
  },
  {
    q: '¿En qué ciudades tiene presencia Prime Deportes durante el torneo?',
    a: 'Cubrimos los 4 principales mercados hispanos de EE.UU.: Miami (Hard Rock Stadium), Dallas (AT&T Stadium), Los Ángeles (SoFi Stadium) y Nueva York/MetLife. Más cobertura digital nacional e internacional desde Colombia.',
  },
  {
    q: '¿Cuál es el perfil demográfico de la audiencia de Prime Deportes?',
    a: 'Hispanos 25-45 años, bilingües, con ingresos medios-altos. 73% se identifican como fanáticos del fútbol (Nielsen 2025). Fuerte concentración en mercados de Miami, Texas y California — los 3 estados con mayor poder adquisitivo hispano en EE.UU.',
  },
  {
    q: '¿Cómo se miden los resultados de mi campaña?',
    a: 'Entregamos reportes semanales con: impresiones verificadas, alcance, Video Completion Rate (VCR), métricas de engagement y tráfico referido. Los paquetes Multimedia Pro y Live Experience incluyen Brand Lift Study con metodología estándar de la industria.',
  },
  {
    q: '¿Se puede contratar publicidad solo para una fase del Mundial?',
    a: 'Sí. Ofrecemos paquetes para: Fase de Grupos (11 jun–3 jul), Ronda de 16/Cuartos (4–11 jul) y el Tramo Final incluyendo la Gran Final (12–19 jul). Los precios varían según la fase. El tramo final tiene precio premium por demanda.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// ADVERTISING PACKS
// ─────────────────────────────────────────────────────────────────────────────
const PACKS = [
  {
    title: 'DIGITAL TOTAL',
    icon: Smartphone,
    coverage: 'TEMPORADA 2025–2026',
    price: 'DESDE $500 USD / MES',
    features: [
      'Banners premium en web y app',
      'Menciones editoriales',
      'Social media tagging',
      'Newsletter feature',
      'Reporte mensual de impacto',
    ],
    featured: false,
  },
  {
    title: 'MULTIMEDIA PRO',
    icon: Mic2,
    coverage: 'MUNDIAL 2026 EXCLUSIVE',
    price: 'DESDE $1,800 USD / MES',
    features: [
      'Todo lo del paquete Digital',
      'Podcast sponsorship (host-read)',
      'YouTube pre-roll integration',
      'Video desde sedes del Mundial',
      'TikTok / Instagram Reels',
      'Brand Lift Study incluido',
    ],
    featured: true,
  },
  {
    title: 'LIVE EXPERIENCE',
    icon: Trophy,
    coverage: 'MUNDIAL 2026 ON-SITE',
    price: 'DESDE $7,500 USD',
    features: [
      'Todo lo del paquete Multimedia',
      'Activaciones en estadios',
      'Fan Zone branding',
      'VIP hospitality',
      'Branded content series',
      'Merchandising co-branded',
    ],
    featured: false,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// NOTICIAS
// ─────────────────────────────────────────────────────────────────────────────
const NOTICIAS = [
  {
    date: '11 MAR 2026',
    title: 'MIAMI SE PREPARA PARA EL PARTIDO INAUGURAL DEL MUNDIAL',
    category: 'SEDES',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d445bcc97a?auto=format&fit=crop&w=800&q=80',
  },
  {
    date: '09 MAR 2026',
    title: 'NUEVAS OPORTUNIDADES PARA MARCAS EN EL FAN ZONE OFICIAL',
    category: 'MARKETING',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
  },
  {
    date: '05 MAR 2026',
    title: 'JORGE RODRÍGUEZ ANALIZA EL SORTEO DE GRUPOS DESDE MIAMI',
    category: 'ANÁLISIS',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// MARKET CREDIBILITY DATA (all stats from verified sources)
// ─────────────────────────────────────────────────────────────────────────────
const MARKET_STATS = [
  { value: '$3T+', label: 'Poder adquisitivo hispano en EE.UU.', source: 'Refuel Agency 2026' },
  { value: '79%', label: 'De televidentes hispanos sienten mayor conexión con anunciantes del Mundial', source: 'Nielsen / Telemundo' },
  { value: '37%', label: 'Mayor lealtad de marca entre fans hispanos del fútbol vs. audiencia general', source: 'Nielsen Sports 2025' },
  { value: '<1%', label: 'Del gasto digital llega a medios en español — pese a ser el 20% de la población', source: 'Nielsen 2025' },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeContent({ articles = [] }: { articles?: Article[] }) {
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.08])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="relative min-h-screen bg-navy-dark bg-pitch">
      <Navbar />
      <Ticker />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/20 via-navy-dark/60 to-navy-dark z-10" />
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
            alt="Estadio de fútbol iluminado — Prime Deportes cobertura Mundial 2026"
            fill
            priority
            className="object-cover grayscale brightness-50"
            sizes="100vw"
          />
        </motion.div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-accent-red text-white text-xs font-black uppercase tracking-[0.4em] mb-10 skew-x-[-15deg]">
              <span className="inline-block skew-x-[15deg] animate-pulse">● LIVE: MUNDIAL 2026 PREVIEW</span>
            </div>

            <h1 className="editorial-title text-4xl sm:text-5xl md:text-7xl lg:text-[9rem] xl:text-[11rem] mb-6">
              DOMINA EL <br />
              <span className="text-gold">MUNDIAL</span>
            </h1>

            <p className="text-base sm:text-xl md:text-3xl font-display font-bold italic text-white/80 max-w-4xl mx-auto mb-16 tracking-tight">
              "La vitrina publicitaria más potente del deporte hispano. Tu marca, en el centro de la acción."
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.a
                href="#packs"
                whileHover={{ scale: 1.08, rotate: -1 }}
                className="bg-gold text-navy px-6 sm:px-10 md:px-12 py-6 font-display font-black text-xl italic uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
              >
                VER PAQUETES →
              </motion.a>
              <motion.a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, rotate: 1 }}
                className="border-4 border-white text-white px-6 sm:px-10 md:px-12 py-6 font-display font-black text-xl italic uppercase tracking-tighter hover:bg-white hover:text-navy transition-all flex items-center gap-3"
              >
                <Calendar size={20} />
                AGENDA 15 MIN GRATIS
              </motion.a>
            </div>

            <Countdown />
          </motion.div>
        </div>

        <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[30rem] font-black text-stroke pointer-events-none opacity-10 select-none">
          PRIME
        </div>
      </section>

      {/* ── URGENCY BAR ──────────────────────────────────────────────────── */}
      <div className="bg-navy border-y-2 border-gold/30 py-4">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { label: 'TELEMUNDO', pct: '90% VENDIDO', color: 'text-white/40' },
            { label: 'FOX SPORTS', pct: '80% VENDIDO', color: 'text-white/40' },
            { label: 'PRIME DEPORTES', pct: 'CUPOS LIMITADOS', color: 'text-gold' },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
              <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{pct}</span>
            </div>
          ))}
          <span className="text-[9px] text-white/15 font-black uppercase tracking-widest hidden lg:inline">* Datos de inventario publicitario Q1 2026</span>
        </div>
      </div>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="py-32 bg-navy-dark border-y-8 border-gold/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-gold font-black tracking-[0.5em] text-xs uppercase mb-3">LA OPORTUNIDAD</div>
            <h2 className="editorial-title text-4xl md:text-6xl">EL MERCADO MÁS GRANDE DEL MUNDIAL</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <StatCard target={73} suffix="%" label="DE HISPANOS EN EE.UU. SON FANÁTICOS DEL FÚTBOL" source="NIELSEN 2025" />
            <StatCard target={3} label="PLATAFORMAS MULTIMEDIA PROPIAS" />
            <StatCard target={16} label="SEDES MUNDIALISTAS CON COBERTURA PRIME" />
            <StatCard target={104} label="PARTIDOS PARA MAXIMIZAR TU INVERSIÓN" />
          </div>
        </div>
      </section>

      {/* ── MEDIA NETWORK ────────────────────────────────────────────────── */}
      <section className="py-16 bg-black/40 border-b-2 border-white/5">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.5em] mb-10">NUESTRA RED DE MEDIOS</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 hover:opacity-80 transition-opacity duration-500">
            {['EL PERIÓDICO DEPORTIVO', 'PRIMEDEPORTES.COM', 'PODCAST DEPORTIVO', 'MUNDIAL 2026 LIVE'].map(name => (
              <div key={name} className="text-xl font-display font-black italic tracking-tighter">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JORGE SECTION ────────────────────────────────────────────────── */}
      <section id="nosotros" className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -top-10 -left-10 text-[15rem] font-black text-white/5 italic select-none pointer-events-none">VOICE</div>
              <h2 className="editorial-title text-5xl md:text-8xl mb-10">
                LA VOZ DEL <br />
                <span className="text-gold">PERIODISMO</span>
              </h2>
              <div className="space-y-8 text-xl text-white/60 font-medium leading-relaxed max-w-xl">
                <p>
                  <span className="text-white font-black italic">Jorge Rodríguez</span> no solo informa — lidera la conversación deportiva en el mercado hispano. Con más de 15 años de trayectoria, su red de medios es el estándar de oro para la cobertura del Mundial.
                </p>
                <p>
                  Desde <span className="text-gold">El Periódico Deportivo</span> hasta el <span className="text-gold">Podcast Deportivo</span>, cada plataforma está diseñada para conectar marcas con el fanático hispano de forma auténtica.
                </p>
              </div>
              <div className="mt-16 flex flex-wrap gap-6">
                {['RADIO', 'TV', 'DIGITAL', 'PRINT', 'PODCAST'].map(tag => (
                  <div key={tag} className="px-6 py-2 border-2 border-gold/30 text-gold font-black text-xs tracking-[0.3em] italic">
                    {tag}
                  </div>
                ))}
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-12 inline-flex items-center gap-3 text-gold font-black text-sm uppercase tracking-widest border-b-2 border-gold pb-1 hover:border-gold-bright hover:text-gold-bright transition-colors"
              >
                <Calendar size={16} />
                AGENDA UNA LLAMADA CON JORGE
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* REPLACE: Swap src with Jorge's actual professional photo */}
              <div className="aspect-[4/5] bg-gradient-to-b from-navy to-navy-dark border-8 border-white/5 relative group overflow-hidden flex items-end">
                <div className="absolute inset-0 bg-gradient-to-t from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <Image
                  src="/jorge.jpg"
                  alt="Jorge Rodríguez — Director General Prime Deportes"
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute bottom-10 left-10 z-20">
                  <div className="bg-gold text-navy px-6 py-2 font-display font-black italic text-2xl mb-2">JORGE RODRÍGUEZ</div>
                  <div className="text-white font-black tracking-widest text-xs uppercase">DIRECTOR GENERAL • PRIME DEPORTES</div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 -right-10 bg-accent-red p-8 shadow-2xl z-30"
              >
                <Mic2 size={44} className="text-white mb-3" />
                <div className="font-display font-black italic text-sm">LIVE BROADCAST</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PACKS ────────────────────────────────────────────────────────── */}
      <section id="packs" className="py-20 md:py-32 lg:py-40 bg-white/[0.02] skew-section">
        <div className="container mx-auto px-6 skew-content">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="text-gold font-black tracking-[0.5em] mb-4 uppercase text-sm">THE PLAYBOOK</div>
              <h2 className="editorial-title text-5xl md:text-8xl">TU ESTRATEGIA <br />GANADORA</h2>
            </div>
            <p className="text-white/40 font-bold max-w-xs text-right">
              Selecciona el nivel de impacto que tu marca necesita. Precios de referencia — solicita propuesta personalizada.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {PACKS.map((pack, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -16 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`p-6 md:p-10 border-t-8 flex flex-col h-full ${pack.featured ? 'border-gold bg-gold/5' : 'border-white/20 bg-white/5'}`}
              >
                <div className={`text-[10px] font-black tracking-widest mb-6 ${pack.featured ? 'text-gold' : 'text-white/40'}`}>
                  {pack.coverage}
                </div>
                <pack.icon size={44} className={pack.featured ? 'text-gold' : 'text-white'} />
                <h3 className="editorial-title text-3xl mt-6 mb-4">{pack.title}</h3>
                <div className={`text-xl font-display font-black italic mb-8 ${pack.featured ? 'text-gold' : 'text-white/80'}`}>
                  {pack.price}
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {pack.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold text-white/60">
                      <Zap size={14} className="text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className={`w-full py-5 font-display font-black italic text-sm uppercase tracking-widest transition-all text-center block ${pack.featured ? 'bg-gold text-navy' : 'border-2 border-white text-white hover:bg-white hover:text-navy'}`}
                >
                  {pack.featured ? 'AGENDAR LLAMADA' : 'SOLICITAR INFO'}
                </a>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center space-y-3">
            <p className="text-white/50 text-sm font-black uppercase tracking-widest">
              Todos los paquetes cubren el torneo completo: <span className="text-gold">11 jun – 19 jul 2026 (39 días)</span>
            </p>
            <p className="text-white/20 text-xs font-black uppercase tracking-widest">
              * Precios de referencia en USD. Paquetes personalizados disponibles según alcance y duración.
            </p>
          </div>

          <div className="mt-16 p-12 bg-accent-red flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <TrendingUp size={56} className="text-white/30 shrink-0" />
              <div>
                <h4 className="text-3xl font-display font-black italic">¿BUSCAS ALGO A MEDIDA?</h4>
                <p className="font-bold opacity-80">Diseñamos estrategias personalizadas para marcas de alto impacto.</p>
              </div>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white text-navy px-12 py-5 font-display font-black italic uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3"
            >
              <Calendar size={18} />
              CONSULTORÍA 15 MIN →
            </a>
          </div>
        </div>
      </section>

      {/* ── CREDIBILITY / MARKET DATA ─────────────────────────────────────── */}
      <section className="py-20 md:py-32 lg:py-40 bg-navy border-y-8 border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="text-accent-red font-black tracking-[0.5em] mb-4 uppercase text-sm">DATOS VERIFICADOS</div>
            <h2 className="editorial-title text-5xl md:text-8xl">
              EL MERCADO MÁS <br />
              <span className="text-gold">VALIOSO DEL MUNDIAL</span>
            </h2>
            <p className="mt-8 text-xl text-white/40 font-bold max-w-2xl mx-auto">
              El mercado hispano es el activo publicitario más subutilizado y de mayor crecimiento en América del Norte.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {MARKET_STATS.map(({ value, label, source }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-l-4 border-gold pl-6 py-6"
              >
                <div className="text-4xl md:text-5xl font-display font-black italic text-gold mb-3">{value}</div>
                <p className="text-sm font-bold text-white/70 leading-snug mb-3">{label}</p>
                <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">{source}</div>
              </motion.div>
            ))}
          </div>

          {/* Pull quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gold/5 border-2 border-gold/20 p-12 text-center max-w-4xl mx-auto"
          >
            <div className="text-5xl text-gold font-black italic mb-6">"</div>
            <blockquote className="text-2xl md:text-3xl font-display font-bold italic text-white leading-snug mb-6">
              Publicar anuncios en español genera un retorno de inversión 39% superior al promedio del mercado general.
            </blockquote>
            <cite className="text-gold font-black text-xs uppercase tracking-widest not-italic">
              — Nielsen, estudio comisionado por TelevisaUnivision
            </cite>
          </motion.div>

          {/* Urgency signal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-accent-red/30 p-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-4 h-4 rounded-full bg-accent-red animate-pulse shrink-0" />
              <div>
                <div className="text-accent-red font-black text-xs uppercase tracking-widest mb-1">DISPONIBILIDAD LIMITADA</div>
                <div className="text-2xl font-display font-black italic">Cupos para el torneo completo — cierre de ventas 1 junio 2026</div>
              </div>
            </div>
            <a
              href="#contacto"
              className="shrink-0 bg-accent-red text-white px-10 py-5 font-display font-black italic uppercase tracking-tighter hover:bg-red-600 transition-colors flex items-center gap-3"
            >
              <ArrowRight size={20} />
              RESERVAR AHORA
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="editorial-title text-4xl md:text-7xl">POR QUÉ <span className="text-gold">PRIME DEPORTES</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Globe,
                title: 'ALCANCE AUTÉNTICO',
                desc: 'Conexión real con la diáspora hispana en EE.UU. y Colombia. No solo impresiones — conversación cultural.',
              },
              {
                icon: Target,
                title: 'AUDIENCIA DE ALTO VALOR',
                desc: '73% de nuestra audiencia son fanáticos del fútbol declarados. El Mundial es su evento del año — y el tuyo.',
              },
              {
                icon: BarChart3,
                title: 'RESULTADOS MEDIBLES',
                desc: 'Reportes semanales con KPIs verificados. Brand lift, alcance, VCR. Sin métricas de vanidad.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group"
              >
                <div className="w-20 h-20 bg-white/5 flex items-center justify-center mb-8 group-hover:bg-gold transition-colors duration-500">
                  <Icon size={40} className="text-gold group-hover:text-navy transition-colors duration-500" />
                </div>
                <h4 className="text-2xl font-display font-black italic mb-4">{title}</h4>
                <p className="text-white/50 font-medium leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ROIEstimator />

      <Testimonials />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 lg:py-40 bg-navy-dark border-t-8 border-white/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <div className="text-gold font-black tracking-[0.5em] mb-4 uppercase text-sm">RESOLVEMOS TUS DUDAS</div>
            <h2 className="editorial-title text-5xl md:text-7xl">PREGUNTAS <br /><span className="text-white">FRECUENTES</span></h2>
          </div>

          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border-b border-white/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-8 text-left group"
                >
                  <span className="text-lg md:text-xl font-display font-black italic text-white group-hover:text-gold transition-colors leading-snug">
                    {q}
                  </span>
                  <ChevronDown
                    size={24}
                    className={`shrink-0 text-gold mt-1 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="pb-8 text-white/60 font-medium leading-relaxed">{a}</p>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/40 font-bold mb-6">¿Tienes otra pregunta?</p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gold text-navy px-10 py-5 font-display font-black italic uppercase tracking-tighter hover:scale-105 transition-transform"
            >
              <Calendar size={20} />
              AGENDA UNA LLAMADA GRATUITA
            </a>
          </div>
        </div>
      </section>

      {/* ── NOTICIAS ─────────────────────────────────────────────────────── */}
      <section id="noticias" className="py-20 md:py-32 lg:py-40 bg-navy-dark border-t-8 border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
              <div className="text-accent-red font-black tracking-[0.5em] mb-4 uppercase text-sm">LATEST UPDATES</div>
              <h2 className="editorial-title text-5xl md:text-8xl">
                NOTICIAS <br /><span className="text-white">DEL MUNDIAL</span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {articles.map((article, i) => (
              <Link key={article.id} href={`/noticias/${article.slug}`}>
                <motion.article
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden mb-6 relative">
                    <div className="absolute top-4 left-4 z-10 bg-gold text-navy px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {article.category}
                    </div>
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
                  <time className="text-gold font-black text-[10px] tracking-widest block mb-2">
                    {new Date(article.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </time>
                  <h3 className="text-2xl font-display font-black italic leading-tight group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                </motion.article>
              </Link>
            ))}
          </div>

          {articles.length > 0 && (
            <div className="mt-16 text-center">
              <Link
                href="/noticias"
                className="inline-flex items-center gap-3 border border-gold text-gold px-8 py-4 font-black text-sm tracking-widest uppercase hover:bg-gold hover:text-navy transition-colors"
              >
                Ver todas las noticias <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 md:py-32 lg:py-40 bg-navy-dark relative border-t-8 border-gold">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-24">
            <div>
              <h2 className="editorial-title text-6xl md:text-9xl mb-12">
                RESERVA <br /><span className="text-gold">TU LUGAR</span>
              </h2>
              <p className="text-2xl font-display font-bold italic text-white/60 mb-16 leading-tight">
                "El Mundial 2026 no espera. Asegura tu presencia en la plataforma de medios más influyente del deporte hispano."
              </p>

              <div className="space-y-12 mb-16">
                <div className="flex gap-8">
                  <div className="text-gold font-black text-4xl italic shrink-0">01</div>
                  <div>
                    <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">LLÁMANOS</div>
                    <a href="tel:+17373512340" className="text-2xl font-display font-black italic hover:text-gold transition-colors block">+1 (737) 351-2340</a>
                    <a href="tel:+573003220068" className="text-xl font-display font-black italic text-white/40 hover:text-gold transition-colors block">+57 (300) 322-0068</a>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-gold font-black text-4xl italic shrink-0">02</div>
                  <div>
                    <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">ESCRÍBENOS</div>
                    <a href="mailto:journalist@primedeportes.com" className="text-2xl font-display font-black italic hover:text-gold transition-colors">
                      journalist@primedeportes.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-gold font-black text-4xl italic shrink-0">03</div>
                  <div>
                    <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">AGENDA DIRECTO</div>
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-2xl font-display font-black italic hover:text-gold transition-colors"
                    >
                      <Calendar size={24} className="text-gold" />
                      LLAMADA DE 15 MIN
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 border-4 border-gold text-gold px-10 py-5 font-display font-black italic uppercase tracking-tighter hover:bg-gold hover:text-navy transition-all"
              >
                <Calendar size={20} />
                AGENDA TU CONSULTORÍA GRATUITA →
              </a>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-20 bg-black border-t-2 border-white/10 pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-4xl font-display font-black italic tracking-tighter">
              PRIME<span className="text-gold">DEPORTES</span>
            </div>
            <nav className="flex gap-10 font-black text-xs tracking-widest text-white/40">
              <a href="https://instagram.com/primedeportes" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">INSTAGRAM</a>
              <a href="https://youtube.com/primedeportes" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">YOUTUBE</a>
              <a href="https://twitter.com/primedeportes" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">X / TWITTER</a>
            </nav>
          </div>
          <div className="mt-12 text-center text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">
            © 2026 PRIME DEPORTES • COBERTURA OFICIAL MUNDIAL 2026 • TODOS LOS DERECHOS RESERVADOS
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ───────────────────────────────────────────────── */}
      <motion.a
        href="https://wa.me/17373512340?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20publicidad%20para%20el%20Mundial%202026"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        whileHover={{ scale: 1.12, rotate: 8 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-8 w-14 h-14 md:w-20 md:h-20 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl z-[110] border-4 border-white"
      >
        <Phone className="text-white" size={32} fill="white" />
      </motion.a>
    </div>
  )
}
