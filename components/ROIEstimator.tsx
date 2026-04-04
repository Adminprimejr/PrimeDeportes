'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calculator, ArrowRight, Calendar } from 'lucide-react'

const GOALS = [
  { id: 'awareness', label: 'Brand Awareness', desc: 'Dar a conocer tu marca' },
  { id: 'consideration', label: 'Consideración', desc: 'Generar interés en tu producto' },
  { id: 'traffic', label: 'Tráfico / Leads', desc: 'Visitas y contactos directos' },
]

const PACKS = {
  digital: {
    name: 'DIGITAL TOTAL',
    price: '$500 USD/mes',
    cpm: 18,
    color: 'border-white/30 bg-white/5',
    textColor: 'text-white',
    featured: false,
  },
  multimedia: {
    name: 'MULTIMEDIA PRO',
    price: '$1,800 USD/mes',
    cpm: 22,
    color: 'border-gold bg-gold/10',
    textColor: 'text-gold',
    featured: true,
  },
  live: {
    name: 'LIVE EXPERIENCE',
    price: '$7,500 USD',
    cpm: 28,
    color: 'border-white/30 bg-white/5',
    textColor: 'text-white',
    featured: false,
  },
}

function getRecommendation(goal: string, impressions: number) {
  if (impressions < 50000 || goal === 'traffic') return 'digital'
  if (impressions < 200000 || goal === 'consideration') return 'multimedia'
  return goal === 'awareness' ? 'multimedia' : 'live'
}

export default function ROIEstimator() {
  const [impressions, setImpressions] = useState(75000)
  const [goal, setGoal] = useState('awareness')
  const [shown, setShown] = useState(false)

  const recommended = getRecommendation(goal, impressions)
  const pack = PACKS[recommended as keyof typeof PACKS]
  const estimatedReach = Math.round(impressions * 0.72)
  const estimatedCost = Math.round((impressions / 1000) * pack.cpm)
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/primedeportes'

  return (
    <section className="py-40 bg-navy border-t-8 border-white/5">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <div className="text-gold font-black tracking-[0.5em] mb-4 uppercase text-sm flex items-center justify-center gap-3">
            <Calculator size={16} />
            CALCULADORA DE IMPACTO
          </div>
          <h2 className="editorial-title text-5xl md:text-7xl">
            ¿CUÁNTO VALE TU <br />
            <span className="text-gold">CAMPAÑA?</span>
          </h2>
          <p className="mt-6 text-white/40 font-bold max-w-xl mx-auto">
            Estima el alcance e inversión de tu campaña durante el Mundial 2026.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Inputs */}
          <div className="space-y-10 bg-white/5 border border-white/10 p-10">
            {/* Goal */}
            <div>
              <label className="text-[10px] font-black text-gold uppercase tracking-widest block mb-5">
                ¿CUÁL ES TU OBJETIVO PRINCIPAL?
              </label>
              <div className="space-y-3">
                {GOALS.map(({ id, label, desc }) => (
                  <button
                    key={id}
                    onClick={() => { setGoal(id); setShown(false) }}
                    className={`w-full flex items-start gap-4 p-4 border-2 text-left transition-all ${goal === id ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${goal === id ? 'border-gold bg-gold' : 'border-white/30'}`}>
                      {goal === id && <div className="w-1.5 h-1.5 rounded-full bg-navy" />}
                    </div>
                    <div>
                      <div className="font-black text-sm">{label}</div>
                      <div className="text-white/40 text-xs font-bold mt-0.5">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Impressions slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-gold uppercase tracking-widest">
                  IMPRESIONES DESEADAS
                </label>
                <span className="font-display font-black italic text-xl text-white">
                  {impressions.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={impressions}
                onChange={e => { setImpressions(Number(e.target.value)); setShown(false) }}
                className="w-full accent-gold h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/25 font-black mt-2">
                <span>10K</span>
                <span>250K</span>
                <span>500K</span>
              </div>
            </div>

            <motion.button
              onClick={() => setShown(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gold text-navy py-5 font-display font-black italic text-lg uppercase tracking-tighter flex items-center justify-center gap-3"
            >
              <Calculator size={20} />
              CALCULAR MI CAMPAÑA
            </motion.button>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {shown ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={`border-2 p-10 space-y-8 ${pack.color}`}
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                    PAQUETE RECOMENDADO
                  </div>
                  <div className={`text-3xl font-display font-black italic ${pack.textColor}`}>
                    {pack.name}
                    {pack.featured && (
                      <span className="ml-3 text-[10px] bg-gold text-navy px-2 py-1 font-black uppercase tracking-widest not-italic align-middle">
                        MEJOR VALOR
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-gold pl-4">
                    <div className="text-3xl font-display font-black italic text-white">
                      {estimatedReach.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mt-1">
                      Alcance único estimado
                    </div>
                  </div>
                  <div className="border-l-4 border-gold pl-4">
                    <div className="text-3xl font-display font-black italic text-white">
                      ${estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mt-1">
                      Inversión estimada (USD)
                    </div>
                  </div>
                  <div className="border-l-4 border-white/20 pl-4">
                    <div className="text-3xl font-display font-black italic text-white">
                      ${pack.cpm}
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mt-1">
                      CPM estimado
                    </div>
                  </div>
                  <div className="border-l-4 border-white/20 pl-4">
                    <div className="text-3xl font-display font-black italic text-white">
                      39%
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mt-1">
                      ROAS adicional en español
                    </div>
                  </div>
                </div>

                <p className="text-white/30 text-xs font-bold leading-relaxed">
                  * Estimaciones basadas en CPM promedio del mercado hispano (Nielsen 2025). El alcance real depende del mix de plataformas seleccionado.
                </p>

                <div className="space-y-3">
                  <a
                    href={calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gold text-navy py-5 font-display font-black italic uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                  >
                    <Calendar size={18} />
                    AGENDAR LLAMADA →
                  </a>
                  <a
                    href="#contacto"
                    className="w-full border-2 border-white/20 text-white py-4 font-display font-black italic uppercase tracking-tighter flex items-center justify-center gap-3 hover:border-white/50 transition-colors text-sm"
                  >
                    <ArrowRight size={16} />
                    SOLICITAR PROPUESTA FORMAL
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-white/10 p-10 flex flex-col items-center justify-center min-h-[400px] text-center gap-6"
              >
                <Calculator size={56} className="text-white/10" />
                <div className="text-white/20 font-black uppercase tracking-widest text-sm">
                  Configura tu campaña y presiona calcular
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
