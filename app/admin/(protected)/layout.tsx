import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token || !verifyToken(token)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      <AdminNav />
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-10">{children}</div>
      </div>
    </div>
  )
}
