'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Search, Check } from 'lucide-react'

interface Props {
  value: string | null
  alt: string | null
  onSelect: (url: string, alt: string) => void
  category?: string
}

// Verified working Unsplash photo IDs grouped by category
const CURATED: Record<string, { id: string; alt: string }[]> = {
  SEDES: [
    { id: 'photo-1574629810360-7efbbe195018', alt: 'Estadio del Mundial 2026 iluminado de noche' },
    { id: 'photo-1464366400600-7168b8af9bc3', alt: 'Estadio con fanáticos en la tribuna' },
    { id: 'photo-1461896836934-ffe607ba8211', alt: 'Estadio moderno con techo retráctil' },
    { id: 'photo-1568702846914-96b305d2aaeb', alt: 'Campo de fútbol desde el aire' },
    { id: 'photo-1575361204480-aadea25e6e68', alt: 'Estadio lleno de aficionados' },
    { id: 'photo-1487466365202-1afdb86c764e', alt: 'Cancha de fútbol vacía al atardecer' },
  ],
  NOTICIAS: [
    { id: 'photo-1553778263-73a83bab9b0c', alt: 'Pelota de fútbol en el césped' },
    { id: 'photo-1431324155629-1a6deb1dec8d', alt: 'Jugadores disputando un partido de fútbol' },
    { id: 'photo-1471295253337-3ceaaedca402', alt: 'Jugador celebrando un gol' },
    { id: 'photo-1519766304817-4f37bda74a26', alt: 'Partido de fútbol en estadio lleno' },
    { id: 'photo-1522778119026-d647f0596c20', alt: 'Fanáticos celebrando un gol en el estadio' },
    { id: 'photo-1560272564-c83b66b1ad12', alt: 'Aficionados con banderas en el estadio' },
  ],
  ANÁLISIS: [
    { id: 'photo-1431324155629-1a6deb1dec8d', alt: 'Jugadores disputando el balón' },
    { id: 'photo-1553778263-73a83bab9b0c', alt: 'Pelota de fútbol sobre el césped' },
    { id: 'photo-1568702846914-96b305d2aaeb', alt: 'Vista aérea del campo de fútbol' },
    { id: 'photo-1519766304817-4f37bda74a26', alt: 'Partido internacional de fútbol' },
    { id: 'photo-1459865264687-595d652de67e', alt: 'Fanáticos en las gradas del estadio' },
    { id: 'photo-1551280857-2b9bbe52acf4', alt: 'Jugador de fútbol en acción' },
  ],
  MARKETING: [
    { id: 'photo-1459865264687-595d652de67e', alt: 'Multitud de fanáticos del fútbol' },
    { id: 'photo-1522778119026-d647f0596c20', alt: 'Fanáticos hispanos celebrando en el estadio' },
    { id: 'photo-1560272564-c83b66b1ad12', alt: 'Aficionados con banderas latinoamericanas' },
    { id: 'photo-1434648957308-5e6a859697e8', alt: 'Estrategia de marketing deportivo' },
    { id: 'photo-1593508512255-86ab42a8e620', alt: 'Transmisión digital del Mundial 2026' },
    { id: 'photo-1551280857-2b9bbe52acf4', alt: 'Campaña publicitaria deportiva' },
  ],
}

function unsplashUrl(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
}
function thumbUrl(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`
}

export default function ImagePicker({ value, alt, onSelect, category = 'NOTICIAS' }: Props) {
  const [open, setOpen] = useState(false)
  const [customUrl, setCustomUrl] = useState(value ?? '')
  const [customAlt, setCustomAlt] = useState(alt ?? '')
  const [tab, setTab] = useState<'gallery' | 'url'>('gallery')

  const photos = CURATED[category] ?? CURATED.NOTICIAS

  function applyCustom() {
    if (!customUrl.trim()) return
    onSelect(customUrl.trim(), customAlt.trim() || 'Imagen del artículo')
    setOpen(false)
  }

  function pickPhoto(photo: { id: string; alt: string }) {
    onSelect(unsplashUrl(photo.id), photo.alt)
    setOpen(false)
  }

  return (
    <div>
      {/* Current image preview */}
      <div
        onClick={() => setOpen(true)}
        className="relative w-full h-40 bg-white/5 border-2 border-dashed border-white/20 hover:border-gold cursor-pointer transition-colors flex items-center justify-center group overflow-hidden"
      >
        {value ? (
          <>
            <Image src={value} alt={alt ?? ''} fill className="object-cover" sizes="600px" />
            <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-black uppercase tracking-widest bg-gold text-navy px-4 py-2">Cambiar imagen</span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Search size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Añadir imagen</p>
            <p className="text-white/20 text-[10px] mt-1">Galería · URL personalizada</p>
          </div>
        )}
      </div>
      {alt && <p className="text-white/20 text-[10px] mt-1 font-black truncate">{alt}</p>}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-navy-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1f35] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h3 className="font-black text-white uppercase tracking-widest text-sm">Seleccionar imagen</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 shrink-0">
              <button
                onClick={() => setTab('gallery')}
                className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${tab === 'gallery' ? 'text-gold border-b-2 border-gold' : 'text-white/40 hover:text-white'}`}
              >
                Galería ({photos.length})
              </button>
              <button
                onClick={() => setTab('url')}
                className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${tab === 'url' ? 'text-gold border-b-2 border-gold' : 'text-white/40 hover:text-white'}`}
              >
                URL personalizada
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'gallery' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => {
                    const isSelected = value === unsplashUrl(photo.id)
                    return (
                      <button
                        key={photo.id}
                        onClick={() => pickPhoto(photo)}
                        className={`relative aspect-video overflow-hidden group border-2 transition-colors ${isSelected ? 'border-gold' : 'border-transparent hover:border-white/40'}`}
                      >
                        <Image src={thumbUrl(photo.id)} alt={photo.alt} fill className="object-cover" sizes="200px" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                            <Check size={24} className="text-gold" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors" />
                        <p className="absolute bottom-0 left-0 right-0 bg-navy/80 text-white/70 text-[9px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                          {photo.alt}
                        </p>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">URL de imagen</label>
                    <input
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors font-mono text-sm placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-white/40 mb-2">Texto alternativo (SEO)</label>
                    <input
                      value={customAlt}
                      onChange={(e) => setCustomAlt(e.target.value)}
                      placeholder="Descripción de la imagen para SEO"
                      className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder-white/20"
                    />
                  </div>
                  {customUrl && (
                    <div className="relative w-full h-48 bg-white/5 border border-white/10 overflow-hidden">
                      <Image src={customUrl} alt={customAlt || 'preview'} fill className="object-cover" sizes="600px"
                        onError={() => {}} />
                    </div>
                  )}
                  <button
                    onClick={applyCustom}
                    disabled={!customUrl.trim()}
                    className="w-full bg-gold text-navy py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30"
                  >
                    Usar esta imagen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
