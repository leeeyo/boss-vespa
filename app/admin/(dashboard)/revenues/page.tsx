'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
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
  BarChart3,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RevenueStats {
  total: number
  thisMonth: number
  lastMonth: number
  growth: number
  ordersCount: number
  averageOrderValue: number
  finishedOrdersCount: number
  byMonth: Array<{
    month: string
    amount: number
    year: number
  }>
}

interface RecentTransaction {
  orderId: string
  total: number
  paymentMethod: string
  createdAt: string | Date
  status: string
  userName?: string
}

export default function AdminRevenuesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    
    if (session?.user?.role === 'admin') {
      // Build API URL with optional date filters
      let apiUrl = '/api/admin/stats'
      if (selectedMonth !== 'all') {
        const month = parseInt(selectedMonth)
        const year = parseInt(selectedYear)
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        apiUrl += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      }
      
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          setStats({
            total: data.revenue?.total || 0,
            thisMonth: data.revenueDetails?.currentMonth || 0,
            lastMonth: data.revenueDetails?.previousMonth || 0,
            growth: data.revenueDetails?.growth || 0,
            ordersCount: data.orders?.total || 0,
            averageOrderValue: data.revenueDetails?.averageOrderValue || 0,
            finishedOrdersCount: data.revenueDetails?.finishedOrdersCount || 0,
            byMonth: data.revenueDetails?.monthlyBreakdown || []
          })
          setRecentTransactions(data.recentTransactions || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (session && session.user?.role) {
      // Non-admin user: clear loading and redirect
      setLoading(false)
      router.push('/admin/dashboard')
    } else if (status === 'unauthenticated') {
      // Already handled in the other useEffect, but ensure loading is cleared
      setLoading(false)
    }
  }, [session, status, router, selectedMonth, selectedYear])

  // Generate years list (current year and 2 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString())

  // Generate months list
  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ]

  // CSV Export function
  const exportToCSV = () => {
    if (!stats || !recentTransactions.length) {
      return
    }

    // Prepare CSV data
    const csvRows: string[] = []
    
    // Header
    csvRows.push('Analyse des Revenus - Export CSV')
    csvRows.push(`Date d'export: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`)
    csvRows.push('')
    
    // Summary section
    csvRows.push('Résumé')
    csvRows.push(`Revenu Total,${stats.total.toLocaleString('fr-FR')} TND`)
    csvRows.push(`Ce mois,${stats.thisMonth.toLocaleString('fr-FR')} TND`)
    csvRows.push(`Mois précédent,${stats.lastMonth.toLocaleString('fr-FR')} TND`)
    csvRows.push(`Croissance,${stats.growth}%`)
    csvRows.push(`Panier moyen,${Math.round(stats.averageOrderValue).toLocaleString('fr-FR')} TND`)
    csvRows.push(`Commandes totales,${stats.ordersCount}`)
    csvRows.push(`Commandes livrées,${stats.finishedOrdersCount}`)
    csvRows.push('')
    
    // Monthly breakdown
    csvRows.push('Répartition mensuelle')
    csvRows.push('Mois,Année,Montant (TND)')
    stats.byMonth.forEach((item) => {
      csvRows.push(`${item.month},${item.year},${item.amount.toLocaleString('fr-FR')}`)
    })
    csvRows.push('')
    
    // Recent transactions
    csvRows.push('Transactions récentes')
    csvRows.push('ID Commande,Date,Montant (TND),Méthode de paiement,Statut,Client')
    recentTransactions.forEach((transaction) => {
      const date = format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
      const statusFr = transaction.status === 'delivered' ? 'Livré' : 
                       transaction.status === 'shipping' ? 'En livraison' :
                       transaction.status === 'confirmed' ? 'Confirmé' :
                       transaction.status === 'pending' ? 'En attente' : transaction.status
      csvRows.push(`${transaction.orderId},${date},${transaction.total.toLocaleString('fr-FR')},${transaction.paymentMethod},${statusFr},${transaction.userName || 'N/A'}`)
    })
    
    // Create and download CSV
    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `revenus-export-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-white/10 bg-white/5 text-white hover:bg-white/10 w-[140px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mois</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedMonth !== 'all' && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white hover:bg-white/10 w-[100px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold shadow-lg shadow-emerald-900/20"
            aria-label="Exporter les données"
            onClick={exportToCSV}
            disabled={!stats || recentTransactions.length === 0}
          >
            <Download size={18} className="mr-2" aria-hidden="true" />
            Exporter CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
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

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-400/10 text-emerald-400">
              <CheckCircle size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Livrées</p>
          <h3 className="text-3xl font-black text-white mt-1 font-mono">
            {stats?.finishedOrdersCount || 0}
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
            {stats?.byMonth && stats.byMonth.length > 0 ? (
              stats.byMonth.map((item, i) => {
                const maxAmount = Math.max(...stats.byMonth.map(m => m.amount), 1)
                const height = (item.amount / maxAmount) * 100
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
              })
            ) : (
              <div className="w-full text-center text-white/40 py-8">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-8 shadow-2xl">
          <h3 className="text-xl font-bold mb-8 text-white">Transactions Récentes</h3>
          <div className="space-y-6" role="list" aria-label="Liste des transactions récentes">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between pb-6 border-b border-white/5 last:border-0 last:pb-0 group"
                  role="listitem"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold border border-amber-400/20 group-hover:bg-amber-400/20 transition-colors text-xs">
                      #{transaction.orderId?.slice(-4) || 'N/A'}
                    </div>
                    <div>
                      <p className="font-bold text-white/90">{transaction.orderId || 'Commande inconnue'}</p>
                      <p className="text-xs text-white/40">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400">+{transaction.total?.toLocaleString() || 0} TND</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">
                      {transaction.status === 'delivered' ? 'Livré' : 
                       transaction.status === 'shipping' ? 'En livraison' :
                       transaction.status === 'confirmed' ? 'Confirmé' :
                       transaction.status === 'pending' ? 'En attente' : transaction.status} ({transaction.paymentMethod || 'COD'})
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/40 py-8">
                Aucune transaction récente
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

