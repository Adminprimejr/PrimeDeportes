'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = ['Inicio', 'Nosotros', 'Packs', 'Noticias']
const MEDIA_KIT_URL = `mailto:journalist@primedeportes.com?subject=Media%20Kit%20Request%20%E2%80%94%20Prime%20Deportes%20Mundial%202026&body=Hola%2C%20quisiera%20recibir%20el%20media%20kit%20de%20Prime%20Deportes%20para%20el%20Mundial%202026.`

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 w-full z-[110] transition-all duration-300 ${isScrolled ? 'bg-navy-dark/95 backdrop-blur-md py-3 border-b-2 border-gold' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <motion.a
          href="#inicio"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-display font-black italic tracking-tighter flex items-center gap-2"
        >
          <div className="bg-gold text-navy px-2 py-0.5 skew-x-[-15deg]">
            <span className="inline-block skew-x-[15deg]">PRIME</span>
          </div>
          <span className="text-white">DEPORTES</span>
        </motion.a>

        <div className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-gold transition-colors"
            >
              {item}
            </a>
          ))}
          <a
            href={MEDIA_KIT_URL}
            className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-gold transition-colors border border-white/10 px-4 py-2 hover:border-gold/40"
          >
            Media Kit
          </a>
          <motion.a
            href="#contacto"
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
            {[...NAV_ITEMS, 'Contacto'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-5xl font-display font-black italic uppercase tracking-tighter text-white hover:text-gold transition-colors"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
