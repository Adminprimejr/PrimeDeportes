import Link from 'next/link'
import { getStats } from '@/lib/articles'
import { FileText, Users, Globe, PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getStats()

  const STAT_CARDS = [
    { label: 'Artículos totales', value: stats.articles, icon: FileText, color: 'text-gold' },
    { label: 'Publicados', value: stats.published, icon: Globe, color: 'text-green-400' },
    { label: 'Borradores', value: stats.articles - stats.published, icon: FileText, color: 'text-white/50' },
    { label: 'Leads recibidos', value: stats.leads, icon: Users, color: 'text-accent-red' },
  ]

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display font-black italic text-white text-4xl md:text-5xl mb-2">
          PANEL <span className="text-gold">PRINCIPAL</span>
        </h1>
        <p className="text-white/40 text-sm font-black tracking-widest uppercase">Bienvenido, Jorge</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 p-6">
            <Icon size={24} className={`${color} mb-4`} />
            <div className={`text-4xl font-black ${color} mb-1`}>{value}</div>
            <div className="text-white/40 text-xs font-black uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/admin/articles/new"
          className="group flex items-center gap-4 p-6 bg-gold/10 border border-gold/30 hover:bg-gold hover:border-gold transition-colors"
        >
          <PlusCircle size={28} className="text-gold group-hover:text-navy" />
          <div>
            <div className="text-white group-hover:text-navy font-black text-lg">Crear nuevo artículo</div>
            <div className="text-white/50 group-hover:text-navy/60 text-sm font-black">Asistente de IA con SEO integrado</div>
          </div>
        </Link>

        <Link
          href="/admin/articles"
          className="group flex items-center gap-4 p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <FileText size={28} className="text-white/50 group-hover:text-white" />
          <div>
            <div className="text-white font-black text-lg">Gestionar artículos</div>
            <div className="text-white/40 text-sm font-black">{stats.articles} artículos en total</div>
          </div>
        </Link>

        <Link
          href="/admin/leads"
          className="group flex items-center gap-4 p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Users size={28} className="text-white/50 group-hover:text-white" />
          <div>
            <div className="text-white font-black text-lg">Ver leads</div>
            <div className="text-white/40 text-sm font-black">{stats.leads} prospectos registrados</div>
          </div>
        </Link>

        <Link
          href="/noticias"
          target="_blank"
          className="group flex items-center gap-4 p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Globe size={28} className="text-white/50 group-hover:text-white" />
          <div>
            <div className="text-white font-black text-lg">Ver sección pública</div>
            <div className="text-white/40 text-sm font-black">Noticias del Mundial en vivo</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
