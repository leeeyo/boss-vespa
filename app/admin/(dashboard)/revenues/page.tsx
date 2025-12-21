'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { 
  DollarSign, 
  TrendingUp, 
  ArrowLeft,
  Loader2,
  Calendar,
  Download,
  Wallet,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RevenueStats {
  total: number
  thisMonth: number
  lastMonth: number
  growth: number
  ordersCount: number
  averageOrderValue: number
  byMonth: Array<{
    month: string
    amount: number
  }>
}

export default function AdminRevenuesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      // Fetch stats (mocked for now since specific revenue endpoint might not exist)
      fetch('/api/admin/stats')
        .then((res) => res.json())
        .then((data) => {
          setStats({
            total: data.revenue?.total || 0,
            thisMonth: (data.revenue?.total || 0) * 0.15,
            lastMonth: (data.revenue?.total || 0) * 0.12,
            growth: 25,
            ordersCount: data.orders?.total || 0,
            averageOrderValue: (data.revenue?.total || 0) / (data.orders?.total || 1),
            byMonth: [
              { month: 'Oct', amount: 45000 },
              { month: 'Nov', amount: 52000 },
              { month: 'Dec', amount: 68000 },
            ]
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Analyse des Revenus
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            aria-label="Filtrer par date"
          >
            <Calendar size={18} className="mr-2" aria-hidden="true" />
            Ce mois
          </Button>
          <Button 
            className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold shadow-lg shadow-emerald-900/20"
            aria-label="Exporter les données"
          >
            <Download size={18} className="mr-2" aria-hidden="true" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-400/10 text-amber-400">
              <DollarSign size={24} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold" role="status">
              <TrendingUp size={16} aria-hidden="true" />
              +{stats?.growth}%
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Revenu Total</p>
          <h3 className="text-3xl font-black text-white mt-1 font-mono">
            {stats?.total?.toLocaleString()} TND
          </h3>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-400/10 text-green-400">
              <Wallet size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Ce mois</p>
          <h3 className="text-3xl font-black text-white mt-1 font-mono">
            {stats?.thisMonth?.toLocaleString()} TND
          </h3>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400">
              <CreditCard size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Panier Moyen</p>
          <h3 className="text-3xl font-black text-white mt-1 font-mono">
            {Math.round(stats?.averageOrderValue || 0).toLocaleString()} TND
          </h3>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-400/10 text-purple-400">
              <BarChart3 size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Commandes</p>
          <h3 className="text-3xl font-black text-white mt-1 font-mono">
            {stats?.ordersCount}
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-white/10 p-8">
          <h3 className="text-xl text-white font-bold mb-8 flex items-center gap-2">
            <TrendingUp className="text-amber-400" size={24} />
            Croissance mensuelle
          </h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {stats?.byMonth.map((item, i) => {
              const height = (item.amount / 70000) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden h-full flex items-end">
                    <div 
                      className="w-full bg-linear-to-t from-amber-600 to-amber-400 rounded-t-xl group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-500"
                      style={{ height: `${height}%` }}
                      role="img"
                      aria-label={`Revenu pour ${item.month}: ${item.amount.toLocaleString()} TND`}
                    />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-8 transition-all bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap shadow-xl">
                      {item.amount.toLocaleString()} TND
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.month}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-8 shadow-2xl">
          <h3 className="text-xl font-bold mb-8 text-white">Transactions Récentes</h3>
          <div className="space-y-6" role="list" aria-label="Liste des transactions récentes">
            {[1, 2, 3, 4].map((_, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between pb-6 border-b border-white/5 last:border-0 last:pb-0 group"
                role="listitem"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold border border-amber-400/20 group-hover:bg-amber-400/20 transition-colors">
                    #{1023 + i}
                  </div>
                  <div>
                    <p className="font-bold text-white/90">Commande CMD-{102345 + i}</p>
                    <p className="text-xs text-white/40">Il y a {i + 1} jour(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-400">+{ (3200 + (i * 450)).toLocaleString() } TND</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Payé (COD)</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

