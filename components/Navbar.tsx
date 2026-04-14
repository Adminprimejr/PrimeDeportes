'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'

// NAV_ITEMS map label → anchor id on the home page
const NAV_ITEMS: { label: string; anchor: string }[] = [
  { label: 'Inicio',    anchor: 'inicio' },
  { label: 'Nosotros',  anchor: 'nosotros' },
  { label: 'Packs',     anchor: 'packs' },
  { label: 'Noticias',  anchor: 'noticias' },
]

const MEDIA_KIT_URL = `mailto:journalist@primedeportes.com?subject=Media%20Kit%20Request%20%E2%80%94%20Prime%20Deportes%20Mundial%202026&body=Hola%2C%20quisiera%20recibir%20el%20media%20kit%20de%20Prime%20Deportes%20para%20el%20Mundial%202026.`

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Resolve href: anchor-only on home, full path elsewhere
  function href(anchor: string) {
    return isHome ? `#${anchor}` : `/#${anchor}`
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 w-full z-[110] transition-all duration-300 ${isScrolled ? 'bg-navy-dark/95 backdrop-blur-md py-3 border-b-2 border-gold' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-display font-black italic tracking-tighter flex items-center gap-2"
          >
            <div className="bg-gold text-navy px-2 py-0.5 skew-x-[-15deg]">
              <span className="inline-block skew-x-[15deg]">PRIME</span>
            </div>
            <span className="text-white">DEPORTES</span>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map(({ label, anchor }) => (
            <a
              key={anchor}
              href={href(anchor)}
              className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-gold transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href={MEDIA_KIT_URL}
            className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-gold transition-colors border border-white/10 px-4 py-2 hover:border-gold/40"
          >
            Media Kit
          </a>
          <motion.a
            href={href('contacto')}
            whileHover={{ scale: 1.05, skewX: -10 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent-red text-white px-8 py-3 font-black text-xs uppercase tracking-widest border-b-4 border-black/20 hover:bg-red-600 transition-colors"
          >
            RESERVA TU ESPACIO
          </motion.a>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menú"
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-navy-dark z-[120] flex flex-col items-center justify-center gap-8"
          >
            <button
              className="absolute top-8 right-8 text-white"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={40} />
            </button>
            {[...NAV_ITEMS, { label: 'Contacto', anchor: 'contacto' }].map(({ label, anchor }) => (
              <a
                key={anchor}
                href={href(anchor)}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-3xl sm:text-4xl font-display font-black italic uppercase tracking-tighter text-white hover:text-gold transition-colors"
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
