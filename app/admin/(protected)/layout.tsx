import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'
import { ToastContainer } from '@/components/admin/Toast'

// Set ADMIN_OPEN=1 in .env.local to bypass login (useful during initial setup)
const BYPASS = process.env.ADMIN_OPEN === '1'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!BYPASS) {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token || !verifyToken(token)) {
      redirect('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      <AdminNav />
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-10">{children}</div>
      </div>
      <ToastContainer />
    </div>
  )
}
