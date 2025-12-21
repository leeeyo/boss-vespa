import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (session?.user?.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-zinc-900">
      <Navigation />
      <div className="pt-24 min-h-[calc(100vh-64px)]">
        {children}
      </div>
      <Footer />
    </div>
  )
}

