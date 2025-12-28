'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Eye,
  ArrowLeft,
  Loader2,
  LayoutGrid,
  List,
  X
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  productId: {
    _id: string
    name: string
    images?: string[]
  } | string
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderId: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  paymentMethod: string
  paid: boolean
  createdAt: string
  deliveryAddress: {
    city: string
  }
}

type ViewMode = 'card' | 'list'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
type PaymentFilter = 'all' | 'paid' | 'unpaid'
type SortOption = 'status-date' | 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

const STATUS_PRIORITY: Order['status'][] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State Management Enhancement
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders-view-mode')
      return (saved === 'card' || saved === 'list') ? saved : 'list'
    }
    return 'list'
  })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('status-date')
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      params.append('page', '1')
      params.append('limit', '1000') // Fetch all for client-side filtering/sorting
      
      fetch(`/api/orders?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(data.orders || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session, statusFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders-view-mode', viewMode)
    }
  }, [viewMode])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      case 'confirmed': return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'shipping': return 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      case 'delivered': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      case 'cancelled': return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
      default: return 'bg-white/10 text-white/60'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock
      case 'confirmed': return CheckCircle2
      case 'shipping': return Truck
      case 'delivered': return CheckCircle2
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmé'
      case 'shipping': return 'En cours'
      case 'delivered': return 'Livré'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  // Filtering and Sorting Logic
  const getFilteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => 
        paymentFilter === 'paid' ? order.paid === true : order.paid === false
      )
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate >= fromDate
      })
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        orderDate.setHours(23, 59, 59, 999)
        return orderDate <= toDate
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status-date':
          const statusA = STATUS_PRIORITY.indexOf(a.status)
          const statusB = STATUS_PRIORITY.indexOf(b.status)
          if (statusA !== statusB) {
            return statusA - statusB
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        
        case 'amount-desc':
          return b.total - a.total
        
        case 'amount-asc':
          return a.total - b.total
        
        default:
          return 0
      }
    })

    return filtered
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange, sortBy])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (paymentFilter !== 'all') count++
    if (dateRange.from) count++
    if (dateRange.to) count++
    return count
  }, [statusFilter, paymentFilter, dateRange])

  const clearFilters = () => {
    setStatusFilter('all')
    setPaymentFilter('all')
    setDateRange({ from: '', to: '' })
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
            Gestion des Commandes
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input 
              placeholder="Rechercher un ID ou ville..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 focus:ring-amber-400/20 text-white"
              aria-label="Rechercher une commande"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 bg-white/5 relative">
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-amber-400 text-black text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900 border-white/10">
              <DropdownMenuLabel>Filtres</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-white/60">Statut</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <DropdownMenuRadioItem value="all">
                  Tous
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  En attente
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="confirmed">
                  Confirmé
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="shipping">
                  En cours
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="delivered">
                  Livré
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelled">
                  Annulé
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-white/60">Paiement</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}>
                <DropdownMenuRadioItem value="all">
                  Tous
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="paid">
                  Payé
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unpaid">
                  Non payé
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-white/60">Date</DropdownMenuLabel>
              <div className="px-2 py-1.5 space-y-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8"
                  placeholder="De"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8"
                  placeholder="À"
                />
              </div>

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={clearFilters}
                    className="text-amber-400 focus:text-amber-400"
                  >
                    <X size={14} className="mr-2" />
                    Effacer les filtres
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[200px] border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-gray-900 border-white/10">
              <SelectItem value="status-date">Statut & Date (Par défaut)</SelectItem>
              <SelectItem value="date-desc">Plus récent d'abord</SelectItem>
              <SelectItem value="date-asc">Plus ancien d'abord</SelectItem>
              <SelectItem value="amount-desc">Montant décroissant</SelectItem>
              <SelectItem value="amount-asc">Montant croissant</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-white/10 rounded-md bg-white/5 p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 px-3 ${viewMode === 'list' ? 'bg-amber-400 text-black hover:bg-amber-400' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              aria-label="Vue liste"
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={`h-8 px-3 ${viewMode === 'card' ? 'bg-amber-400 text-black hover:bg-amber-400' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              aria-label="Vue carte"
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mb-4 text-sm text-white/60">
          Affichage de {getFilteredAndSortedOrders.length} commande{getFilteredAndSortedOrders.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' && ` avec le statut "${getStatusLabel(statusFilter as Order['status'])}"`}
          {paymentFilter !== 'all' && ` ${paymentFilter === 'paid' ? 'payées' : 'non payées'}`}
        </div>
      )}

      {/* Content */}
      {getFilteredAndSortedOrders.length > 0 ? (
        viewMode === 'list' ? (
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60 font-bold">ID Commande</TableHead>
                  <TableHead className="text-white/60 font-bold">Client/Ville</TableHead>
                  <TableHead className="text-white/60 font-bold">Date</TableHead>
                  <TableHead className="text-white/60 font-bold text-right">Montant</TableHead>
                  <TableHead className="text-white/60 font-bold">Statut</TableHead>
                  <TableHead className="text-white/60 font-bold">Paiement</TableHead>
                  <TableHead className="text-white/60 font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredAndSortedOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status)
                  return (
                    <TableRow 
                      key={order._id} 
                      className="border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-mono font-bold">
                        <Link 
                          href={`/admin/orders/${order._id}`}
                          className="text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          {order.orderId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-white/90">
                        {order.deliveryAddress?.city || 'N/A'}
                      </TableCell>
                      <TableCell className="text-white/90">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-amber-400">
                        {order.total?.toLocaleString()} TND
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(order.status)} text-xs px-2 py-1 flex items-center gap-1 w-fit`}
                        >
                          <StatusIcon size={12} />
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.paid ? 'default' : 'outline'}
                          className={order.paid ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}
                        >
                          {order.paid ? 'Payé' : 'Non payé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order._id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            aria-label={`Voir les détails de la commande ${order.orderId}`}
                          >
                            <Eye size={16} />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid gap-4">
            {getFilteredAndSortedOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <Card key={order._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Status Bar */}
                    <div className={`w-1 lg:w-2 ${getStatusColor(order.status).split(' ')[1].replace('text-', 'bg-')}`} />
                    
                    <div className="flex-1 p-6 flex flex-col lg:flex-row items-center gap-6">
                      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 w-full text-center lg:text-left">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">ID Commande</p>
                          <p className="text-xl font-black text-white">{order.orderId}</p>
                        </div>
                        
                        <div className="h-10 w-px bg-white/5 hidden lg:block" />
                        
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Client & Ville</p>
                          <p className="text-lg font-bold text-white/90">{order.deliveryAddress?.city || 'N/A'}</p>
                        </div>

                        <div className="h-10 w-px bg-white/5 hidden lg:block" />

                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Date</p>
                          <p className="text-lg font-bold text-white/90">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:w-auto">
                        <div className="text-center lg:text-right min-w-[120px]">
                          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">Montant</p>
                          <p className="text-2xl font-black text-amber-400 font-mono">
                            {order.total?.toLocaleString()} TND
                          </p>
                        </div>

                        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          <StatusIcon size={14} />
                          {getStatusLabel(order.status)}
                        </div>

                        <Badge 
                          variant={order.paid ? 'default' : 'outline'}
                          className={order.paid ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}
                        >
                          {order.paid ? 'Payé' : 'Non payé'}
                        </Badge>

                        <Link href={`/admin/orders/${order._id}`}>
                          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">
                            <Eye size={18} className="mr-2" />
                            Détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <ShoppingCart className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white/60">Aucune commande trouvée</h3>
          <p className="text-white/40">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      )}
    </div>
  )
}

