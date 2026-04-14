import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="py-16 bg-black border-t-2 border-white/10 pb-28">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <Link href="/" className="text-3xl font-display font-black italic tracking-tighter hover:opacity-80 transition-opacity">
            PRIME<span className="text-gold">DEPORTES</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-6 md:gap-10 font-black text-xs tracking-widest text-white/40">
            <Link href="/" className="hover:text-gold transition-colors">INICIO</Link>
            <Link href="/noticias" className="hover:text-gold transition-colors">NOTICIAS</Link>
            <Link href="/#packs" className="hover:text-gold transition-colors">PAQUETES</Link>
            <Link href="/#contacto" className="hover:text-gold transition-colors">CONTACTO</Link>
            <a href="https://instagram.com/primedeportes" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">INSTAGRAM</a>
            <a href="https://youtube.com/primedeportes" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">YOUTUBE</a>
          </nav>
        </div>
        <div className="mt-10 text-center text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">
          © 2026 PRIME DEPORTES · COBERTURA OFICIAL MUNDIAL 2026 · TODOS LOS DERECHOS RESERVADOS
        </div>
      </div>
    </footer>
  )
}
