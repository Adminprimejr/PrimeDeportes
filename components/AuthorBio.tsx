import Image from 'next/image'
import Link from 'next/link'

interface Props {
  showArticlesLink?: boolean
}

export default function AuthorBio({ showArticlesLink = true }: Props) {
  return (
    <div className="mt-16 border-t border-white/10 pt-12">
      <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mb-8">Sobre el autor</p>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Photo */}
        <div className="relative w-24 h-24 shrink-0 overflow-hidden border-2 border-gold">
          <Image
            src="/jorge.jpg"
            alt="Jorge Rodríguez — Director General Prime Deportes"
            fill
            className="object-cover object-top"
            sizes="96px"
          />
        </div>

        {/* Bio */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-display font-black italic text-white text-xl">Jorge Rodríguez</h3>
            <span className="bg-gold text-navy px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Director General</span>
          </div>
          <p className="text-gold text-[10px] font-black tracking-widest uppercase mb-3">
            Prime Deportes · Medios deportivos en español
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Periodista deportivo con más de 15 años cubriendo el fútbol latinoamericano en Estados Unidos y Colombia.
            Director General de Prime Deportes, la plataforma de medios hispanos especializada en el mercado deportivo de habla española en Norteamérica.
            Ha cubierto tres Copas del Mundo y es una voz referente en el ecosistema del fútbol hispano en EE.UU.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="https://instagram.com/primedeportes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-gold transition-colors"
            >
              Instagram ↗
            </a>
            <a
              href="https://youtube.com/primedeportes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-gold transition-colors"
            >
              YouTube ↗
            </a>
            {showArticlesLink && (
              <Link
                href="/noticias"
                className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-gold transition-colors"
              >
                Ver todos los artículos ↗
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
