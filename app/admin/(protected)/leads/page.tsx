import { getLeads, type Lead } from '@/lib/articles'

const PACK_COLORS: Record<string, string> = {
  digital: 'bg-white/10 text-white',
  multimedia: 'bg-gold/20 text-gold',
  live: 'bg-accent-red/20 text-red-400',
}

const PACK_LABELS: Record<string, string> = {
  digital: 'Digital Total — $500',
  multimedia: 'Multimedia Pro — $1,800',
  live: 'Live Experience — $7,500',
}

export default async function LeadsPage() {
  const leads: Lead[] = await getLeads()

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display font-black italic text-white text-4xl mb-1">
          LEADS
        </h1>
        <p className="text-white/40 text-xs font-black tracking-widest uppercase">{leads.length} prospectos registrados</p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 text-center">
          <p className="text-white/40 text-sm font-black uppercase tracking-widest">No hay leads todavía</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white/5 border border-white/10 p-6 hover:border-white/20 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-black text-white text-lg">{lead.name}</span>
                    {lead.pack && (
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${PACK_COLORS[lead.pack] ?? 'bg-white/10 text-white'}`}>
                        {PACK_LABELS[lead.pack] ?? lead.pack}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <a href={`mailto:${lead.email}`} className="text-gold text-sm font-black hover:underline">{lead.email}</a>
                    {lead.company && <span className="text-white/40 text-sm">{lead.company}</span>}
                  </div>
                  {lead.message && (
                    <p className="text-white/50 text-sm leading-relaxed border-l-2 border-gold/30 pl-3">{lead.message}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <time className="text-white/30 text-xs font-black uppercase tracking-widest">
                    {new Date(lead.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
