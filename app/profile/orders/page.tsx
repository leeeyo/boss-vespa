'use client'

import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Package, 
  Loader2, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  SlidersHorizontal,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  name: string
}

interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  deliveryAddress: {
    street?: string
    city?: string
    postalCode?: string
  }
  deliveryRequested: boolean
  createdAt: string
}

const statusConfig = {
  pending: { 
    label: 'En attente', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Clock
  },
  confirmed: { 
    label: 'Confirmée', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle
  },
  shipping: { 
    label: 'En livraison', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Truck
  },
  delivered: { 
    label: 'Livrée', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Annulée', 
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: XCircle
  },
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const [prevSessionEmail, setPrevSessionEmail] = useState<string | null>(null)
  const [userData, setUserData] = useState({ name: '', email: '' })

  const sessionEmail = session?.user?.email ?? null
  if (sessionEmail !== prevSessionEmail) {
    setPrevSessionEmail(sessionEmail)
    if (sessionEmail) {
      setUserData({
        name: session?.user?.name || '',
        email: sessionEmail,
      })
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' TND'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <NavigationClientWrapper />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                Mes Commandes
              </h1>
              <p className="text-white/60">Suivez l&apos;état de vos commandes en temps réel.</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button 
                type="submit"
                variant="outline" 
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="p-6 text-center border-b border-white/10 bg-white/5">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-amber-400 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-black text-black">
                      {userData.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{userData.name}</h3>
                  <p className="text-sm text-white/40">{userData.email}</p>
                </div>
                <nav className="p-2">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <User size={18} />
                    Informations personnelles
                  </Link>
                  <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-400 text-black font-bold transition-all">
                    <Package size={18} />
                    Mes commandes
                  </Link>
                  <Link href="/profile/preferences" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <SlidersHorizontal size={18} />
                    Préférences
                  </Link>
                  <Link href="/profile/security" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <Shield size={18} />
                    Sécurité
                  </Link>
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucune commande</h3>
                    <p className="text-white/50 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
                    <Link href="/collection">
                      <Button className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold">
                        Découvrir nos produits
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => {
                  const statusInfo = statusConfig[order.status]
                  const StatusIcon = statusInfo.icon
                  const isExpanded = expandedOrder === order._id

                  return (
                    <Card 
                      key={order._id} 
                      className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/[0.07] transition-colors"
                    >
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="w-full p-6 text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{order.orderId}</h3>
                              <p className="text-sm text-white/50">{formatDate(order.createdAt)}</p>
                              <p className="text-sm text-white/40 mt-1">
                                {order.items.length} article{order.items.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-amber-400">{formatPrice(order.total)}</p>
                              <Badge className={`${statusInfo.color} border mt-1`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-white/40" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-white/10 pt-4 space-y-4">
                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-3">Articles commandés</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div 
                                  key={index}
                                  className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg"
                                >
                                  <div>
                                    <p className="text-white font-medium">{item.name}</p>
                                    <p className="text-sm text-white/50">Quantité: {item.quantity}</p>
                                  </div>
                                  <p className="text-amber-400 font-semibold">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between text-sm text-white/60 mb-1">
                              <span>Sous-total</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.deliveryRequested && (
                              <div className="flex justify-between text-sm text-white/60 mb-1">
                                <span>Livraison</span>
                                <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Gratuit'}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-white mt-2 pt-2 border-t border-white/10">
                              <span>Total</span>
                              <span className="text-amber-400">{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          {order.deliveryRequested && order.deliveryAddress && (
                            <div className="border-t border-white/10 pt-4">
                              <h4 className="text-sm font-semibold text-white/70 mb-2">Adresse de livraison</h4>
                              <p className="text-white/60 text-sm">
                                {order.deliveryAddress.street && <>{order.deliveryAddress.street}<br /></>}
                                {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}