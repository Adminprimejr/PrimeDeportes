'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Users, PlusCircle, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Artículos', icon: FileText },
  { href: '/admin/articles/new', label: 'Nuevo artículo', icon: PlusCircle },
  { href: '/admin/leads', label: 'Leads', icon: Users },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={mobileOpen}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gold text-navy p-2"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#050a15] border-r border-white/10 z-40 flex flex-col transform transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="font-display font-black italic text-white text-xl">
            PRIME <span className="text-gold">ADMIN</span>
          </Link>
          <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mt-1">Panel de gestión</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-black tracking-wide transition-colors ${
                  active
                    ? 'bg-gold text-navy'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-black tracking-wide text-white/40 hover:text-accent-red transition-colors w-full"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-sm font-black tracking-wide text-white/30 hover:text-white transition-colors mt-1"
          >
            Ver sitio →
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
