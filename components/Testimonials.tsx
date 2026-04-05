'use client'

import { motion } from 'motion/react'
import { Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote: 'La cobertura de Prime Deportes durante la Copa América 2024 superó todas nuestras expectativas. Llegamos a nuestro público hispano con una eficiencia que no habíamos visto en ningún otro medio.',
    name: 'María González',
    role: 'Directora de Marketing',
    company: 'Grupo Financiero Latino',
    result: '+340% alcance en mercado hispano',
  },
  {
    quote: 'Jorge y su equipo entienden a la audiencia hispana como nadie. Nuestra campaña generó más leads calificados en 4 semanas que todo el año anterior combinado.',
    name: 'Carlos Ramírez',
    role: 'VP de Publicidad',
    company: 'Inmobiliaria Sur Florida',
    result: '2.8K leads calificados en 4 semanas',
  },
  {
    quote: 'El equipo de Prime Deportes es increíblemente profesional y estratégico. No solo colocaron nuestros anuncios — crearon contenido editorial que posicionó nuestra marca como parte de la conversación del Mundial.',
    name: 'Patricia Vega',
    role: 'CMO',
    company: 'Seguros del Continente',
    result: '73% brand recall entre audiencia objetivo',
  },
]

export default function Testimonials() {
  return (
    <section className="py-32 bg-navy border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <div className="text-accent-red font-black tracking-[0.5em] mb-4 uppercase text-sm">LO QUE DICEN NUESTROS CLIENTES</div>
          <h2 className="editorial-title text-5xl md:text-7xl text-white">
            RESULTADOS <br /><span className="text-gold">REALES</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-white/3 border border-white/10 p-8 hover:border-gold/40 transition-colors group"
            >
              {/* Gold result badge */}
              <div className="inline-block bg-gold text-navy px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-6">
                {t.result}
              </div>

              {/* Quote icon */}
              <Quote size={24} className="text-gold/30 mb-4" />

              {/* Quote text */}
              <blockquote className="text-white/70 text-sm leading-relaxed mb-8 italic">
                "{t.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="border-t border-white/10 pt-6">
                <div className="font-black text-white">{t.name}</div>
                <div className="text-white/40 text-xs font-black uppercase tracking-widest mt-1">{t.role}</div>
                <div className="text-gold text-xs font-black mt-1">{t.company}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs font-black uppercase tracking-widest mt-12">
          * Testimonios de campañas anteriores. Resultados individuales pueden variar.
        </p>
      </div>
    </section>
  )
}
