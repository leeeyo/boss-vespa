'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShoppingCart, Package, Users, DollarSign, FileText, MessageSquare, ArrowRight } from 'lucide-react'

interface DashboardStats {
  orders: {
    total: number
    pending: number
    recent: number
  }
  revenue: {
    total: number
    currency: string
  }
  products: {
    total: number
    active: number
  }
  personalizations: {
    total: number
    pending: number
  }
  devis: {
    total: number
    pending: number
  }
  blog: {
    total: number
    published: number
  }
  topProducts: Array<{
    name: string
    totalSold: number
    revenue: number
  }>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/admin/stats')
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  const adminModules = [
    {
      title: 'Commandes',
      description: 'Gérer les commandes et livraisons',
      icon: ShoppingCart,
      color: 'text-amber-400',
      href: '/admin/orders',
      stats: `${stats?.orders?.total || 0} totales`,
      badge: stats?.orders?.pending ? `${stats.orders.pending} en attente` : null
    },
    {
      title: 'Revenus',
      description: 'Analyse des ventes et revenus',
      icon: DollarSign,
      color: 'text-green-400',
      href: '/admin/revenues',
      stats: `${stats?.revenue?.total?.toLocaleString() || 0} ${stats?.revenue?.currency || 'TND'}`,
    },
    {
      title: 'Produits',
      description: 'Gérer le catalogue et les stocks',
      icon: Package,
      color: 'text-blue-400',
      href: '/admin/products',
      stats: `${stats?.products?.total || 0} produits`,
      badge: stats?.products?.active ? `${stats.products.active} actifs` : null
    },
    {
      title: 'Blog',
      description: 'Articles et actualités',
      icon: FileText,
      color: 'text-cyan-400',
      href: '/admin/blog',
      stats: `${stats?.blog?.total || 0} articles`,
    },
    {
      title: 'Utilisateurs',
      description: 'Gestion des clients et rôles',
      icon: Users,
      color: 'text-purple-400',
      href: '/admin/users',
      stats: 'Gestion active',
    },
    {
      title: 'Devis & Custom',
      description: 'Demandes personnalisées',
      icon: MessageSquare,
      color: 'text-rose-400',
      href: '/admin/personalizations',
      stats: `${(stats?.personalizations?.total || 0) + (stats?.devis?.total || 0)} demandes`,
      badge: (stats?.personalizations?.pending || 0) + (stats?.devis?.pending || 0) > 0 ? 'Action requise' : null
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Tableau de bord
        </h1>
        <p className="text-white/60">Bienvenue dans l&apos;interface d&apos;administration Boss Vespa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group cursor-pointer h-full shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={`p-3 rounded-2xl bg-white/5 ${module.color}`}>
                  <module.icon className="h-6 w-6" />
                </div>
                {module.badge && (
                  <span className="px-2 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {module.badge}
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-white text-xl font-bold group-hover:text-amber-400 transition-colors">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-white/50 mt-1">
                  {module.description}
                </CardDescription>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-bold text-white/90">
                    {module.stats}
                  </span>
                  <div className="p-2 rounded-full bg-white/5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Top Products Section */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="text-amber-400" size={24} />
            Produits les plus vendus
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4 text-center">Ventes</th>
                  <th className="px-6 py-4 text-right">Revenus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.topProducts.map((product, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold">{product.name}</td>
                    <td className="px-6 py-4 text-center">{product.totalSold}</td>
                    <td className="px-6 py-4 text-right font-mono text-amber-400">
                      {product.revenue.toLocaleString()} TND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

