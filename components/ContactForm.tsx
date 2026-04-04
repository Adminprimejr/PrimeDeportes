'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '', pack: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('error')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/primedeportes'

  if (status === 'success') {
    return (
      <div className="bg-white/5 p-12 border-2 border-gold/30 flex flex-col items-center justify-center gap-6 min-h-[400px] text-center">
        <CheckCircle2 size={64} className="text-gold" />
        <h3 className="text-3xl font-display font-black italic">¡Solicitud Enviada!</h3>
        <p className="text-white/60 font-bold max-w-sm">
          Revisaremos tu solicitud y te contactaremos en menos de 24 horas.
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 bg-gold text-navy px-10 py-4 font-display font-black italic uppercase tracking-tighter hover:scale-105 transition-transform"
        >
          O AGENDA UNA LLAMADA AHORA →
        </a>
      </div>
    )
  }

  const inputClass = 'w-full bg-transparent border-b-2 border-white/20 py-3 focus:outline-none focus:border-gold transition-colors font-bold'
  const labelClass = 'text-[10px] font-black text-gold uppercase tracking-widest'

  return (
    <div className="bg-white/5 p-12 border-2 border-white/10">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className={labelClass}>NOMBRE *</label>
            <input type="text" required value={form.name} onChange={set('name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>EMPRESA *</label>
            <input type="text" required value={form.company} onChange={set('company')} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>EMAIL CORPORATIVO *</label>
          <input type="email" required value={form.email} onChange={set('email')} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>PAQUETE DE INTERÉS</label>
          <select value={form.pack} onChange={set('pack')} className={`${inputClass} bg-navy-dark`}>
            <option value="">Seleccionar...</option>
            <option value="digital">Digital Total — desde $2,500 USD/mes</option>
            <option value="multimedia">Multimedia Pro — desde $8,000 USD/mes</option>
            <option value="live">Live Experience — desde $25,000 USD</option>
            <option value="custom">Estrategia a medida</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>MENSAJE</label>
          <textarea rows={4} value={form.message} onChange={set('message')} className={`${inputClass} resize-none`} />
        </div>

        {status === 'error' && (
          <p className="text-accent-red font-bold text-sm">
            Hubo un error al enviar. Escríbenos a{' '}
            <a href="mailto:journalist@primedeportes.com" className="underline">
              journalist@primedeportes.com
            </a>
          </p>
        )}

        <motion.button
          type="submit"
          disabled={status === 'loading'}
          whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gold text-navy py-6 font-display font-black italic text-xl uppercase tracking-tighter shadow-2xl disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {status === 'loading' ? (
            <><Loader2 size={24} className="animate-spin" /> ENVIANDO...</>
          ) : (
            'ENVIAR SOLICITUD →'
          )}
        </motion.button>

        <p className="text-white/30 text-xs text-center font-bold">
          O contáctanos por{' '}
          <a
            href="https://wa.me/17373512340?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20publicidad%20para%20el%20Mundial%202026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            WhatsApp
          </a>{' '}
          — respondemos en menos de 1 hora
        </p>
      </form>
    </div>
  )
}
