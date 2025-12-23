'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Printer,
  Phone,
  Mail,
  Calendar,
  Hash,
  Receipt,
  Box,
  PackageCheck,
  Ban
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface OrderItem {
  productId: {
    _id: string
    name: string
    images?: string[]
    slug?: string
  } | string
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderId: string
  userId: {
    _id: string
    name?: string
    email?: string
    phone?: string
  } | string
  items: OrderItem[]
  personalizationId?: {
    _id: string
    baseModel?: string
    colors?: Record<string, string>
  }
  subtotal: number
  shippingCost: number
  total: number
  deliveryAddress: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  deliveryZone?: string
  deliveryRequested: boolean
  paid: boolean
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    bgColor: 'bg-amber-400',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    bgColor: 'bg-blue-400',
    icon: CheckCircle2,
  },
  shipping: {
    label: 'En livraison',
    color: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    bgColor: 'bg-purple-400',
    icon: Truck,
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    bgColor: 'bg-emerald-400',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    bgColor: 'bg-rose-400',
    icon: Ban,
  },
}

const STATUS_FLOW = ['pending', 'confirmed', 'shipping', 'delivered'] as const

export default function AdminOrderDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user?.role === 'admin' && orderId) {
      fetchOrder()
    }
  }, [session, orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      toast.error('Commande non trouvée')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      const updatedOrder = await res.json()
      setOrder(updatedOrder)
      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label}`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (paid: boolean) => {
    if (!order) return
    setUpdating(true)
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid }),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      const updatedOrder = await res.json()
      setOrder(updatedOrder)
      toast.success(paid ? 'Marquée comme payée' : 'Marquée comme non payée')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current
    if (!printContent || !order) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const customerName = typeof order.userId === 'object' ? order.userId.name : 'Client'
    const customerEmail = typeof order.userId === 'object' ? order.userId.email : ''
    const customerPhone = typeof order.userId === 'object' ? order.userId.phone : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px;
              color: #1a1a1a;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f59e0b;
            }
            .logo { 
              font-size: 28px; 
              font-weight: 800;
              color: #f59e0b;
            }
            .invoice-info { text-align: right; }
            .invoice-info h2 { font-size: 24px; color: #333; margin-bottom: 8px; }
            .invoice-info p { color: #666; font-size: 14px; }
            .section { margin-bottom: 30px; }
            .section-title { 
              font-size: 14px; 
              text-transform: uppercase; 
              letter-spacing: 1px;
              color: #f59e0b;
              font-weight: 600;
              margin-bottom: 12px;
            }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .info-box p { color: #333; margin-bottom: 4px; }
            .info-box p span { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { 
              text-align: left; 
              padding: 12px; 
              background: #f8f8f8; 
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #666;
              border-bottom: 2px solid #e5e5e5;
            }
            td { 
              padding: 12px; 
              border-bottom: 1px solid #eee;
              color: #333;
            }
            .totals { 
              margin-top: 20px; 
              text-align: right;
              padding-top: 20px;
              border-top: 2px solid #f59e0b;
            }
            .totals p { margin-bottom: 8px; color: #666; }
            .totals .total { 
              font-size: 24px; 
              font-weight: 700;
              color: #f59e0b;
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #999;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            @media print {
              body { padding: 20px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BOSS VESPA</div>
            <div class="invoice-info">
              <h2>FACTURE</h2>
              <p><strong>${order.orderId}</strong></p>
              <p>${new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>

          <div class="grid section">
            <div class="info-box">
              <p class="section-title">Informations Client</p>
              <p><strong>${customerName || 'N/A'}</strong></p>
              ${customerEmail ? `<p><span>Email:</span> ${customerEmail}</p>` : ''}
              ${customerPhone ? `<p><span>Tél:</span> ${customerPhone}</p>` : ''}
            </div>
            <div class="info-box">
              <p class="section-title">Adresse de Livraison</p>
              ${order.deliveryAddress.street ? `<p>${order.deliveryAddress.street}</p>` : ''}
              <p>${order.deliveryAddress.city || 'N/A'}${order.deliveryAddress.postalCode ? `, ${order.deliveryAddress.postalCode}` : ''}</p>
              ${order.deliveryAddress.country ? `<p>${order.deliveryAddress.country}</p>` : ''}
            </div>
          </div>

          <div class="section">
            <p class="section-title">Articles Commandés</p>
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th style="text-align: center">Qté</th>
                  <th style="text-align: right">Prix Unit.</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: right">${item.price.toLocaleString()} TND</td>
                    <td style="text-align: right">${(item.price * item.quantity).toLocaleString()} TND</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <p>Sous-total: <strong>${order.subtotal.toLocaleString()} TND</strong></p>
            <p>Livraison: <strong>${order.shippingCost.toLocaleString()} TND</strong></p>
            <p class="total">Total: ${order.total.toLocaleString()} TND</p>
          </div>

          <div class="section" style="margin-top: 30px;">
            <p class="section-title">Informations de Paiement</p>
            <p><strong>Méthode:</strong> ${order.paymentMethod === 'COD' ? 'Paiement à la livraison' : order.paymentMethod}</p>
            <p><strong>Statut:</strong> ${order.paid ? 'Payée' : 'En attente de paiement'}</p>
          </div>

          <div class="footer">
            <p>Merci pour votre confiance!</p>
            <p>BOSS VESPA - Votre spécialiste Vespa en Tunisie</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const getStatusIndex = (status: string) => {
    return STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number])
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const StatusIcon = STATUS_CONFIG[order.status].icon
  const customerName = typeof order.userId === 'object' ? order.userId.name : null
  const customerEmail = typeof order.userId === 'object' ? order.userId.email : null
  const customerPhone = typeof order.userId === 'object' ? order.userId.phone : null

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <Link 
            href="/admin/orders" 
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux commandes
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl lg:text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Commande {order.orderId}
            </h1>
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${STATUS_CONFIG[order.status].color}`}>
              <StatusIcon size={14} />
              {STATUS_CONFIG[order.status].label}
            </div>
          </div>
          <p className="text-white/40 mt-2">
            Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 hover:bg-white/10"
            onClick={handlePrintInvoice}
          >
            <Printer size={18} className="mr-2" />
            Imprimer Facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 rounded-lg">
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Articles commandés</h2>
                <span className="ml-auto text-sm text-white/40">{order.items.length} article(s)</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item, index) => {
                const product = typeof item.productId === 'object' ? item.productId : null
                const imageUrl = product?.images?.[0] || '/placeholder.png'
                
                return (
                  <div key={index} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{item.name}</h3>
                      {product?.slug && (
                        <Link 
                          href={`/admin/products/${product._id}/edit`}
                          className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Voir le produit →
                        </Link>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Quantité</p>
                      <p className="text-lg font-bold text-white">×{item.quantity}</p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Prix</p>
                      <p className="text-lg font-bold text-amber-400">{item.price.toLocaleString()} TND</p>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-lg font-bold text-white">{(item.price * item.quantity).toLocaleString()} TND</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-6 bg-white/5 border-t border-white/10">
              <div className="flex flex-col gap-2 items-end">
                <div className="flex justify-between w-full max-w-xs text-white/60">
                  <span>Sous-total:</span>
                  <span className="font-mono">{order.subtotal.toLocaleString()} TND</span>
                </div>
                <div className="flex justify-between w-full max-w-xs text-white/60">
                  <span>Livraison:</span>
                  <span className="font-mono">{order.shippingCost.toLocaleString()} TND</span>
                </div>
                <div className="flex justify-between w-full max-w-xs pt-2 border-t border-white/10">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">{order.total.toLocaleString()} TND</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Timeline */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Historique de la commande</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="relative">
                {STATUS_FLOW.map((statusKey, index) => {
                  const config = STATUS_CONFIG[statusKey]
                  const StatusStepIcon = config.icon
                  const currentIndex = getStatusIndex(order.status)
                  const isCompleted = index <= currentIndex && order.status !== 'cancelled'
                  const isCurrent = statusKey === order.status
                  const isLast = index === STATUS_FLOW.length - 1
                  
                  return (
                    <div key={statusKey} className="flex items-start gap-4 relative">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div 
                          className={`absolute left-5 top-10 w-0.5 h-12 ${
                            isCompleted && !isCurrent ? config.bgColor : 'bg-white/10'
                          }`}
                        />
                      )}
                      
                      {/* Status Icon */}
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          isCompleted 
                            ? `${config.bgColor} border-transparent` 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <StatusStepIcon 
                          size={18} 
                          className={isCompleted ? 'text-white' : 'text-white/30'}
                        />
                      </div>
                      
                      {/* Status Info */}
                      <div className={`pb-8 ${isCurrent ? '' : ''}`}>
                        <p className={`font-bold ${isCompleted ? 'text-white' : 'text-white/30'}`}>
                          {config.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-white/40 mt-1">
                            {order.updatedAt !== order.createdAt ? (
                              <>Mis à jour le {new Date(order.updatedAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</>
                            ) : (
                              <>Statut actuel</>
                            )}
                          </p>
                        )}
                        {statusKey === 'pending' && index <= currentIndex && (
                          <p className="text-sm text-white/40 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {/* Cancelled Status if applicable */}
                {order.status === 'cancelled' && (
                  <div className="flex items-start gap-4 relative mt-4 pt-4 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-rose-400 border-2 border-transparent">
                      <Ban size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-rose-400">Commande Annulée</p>
                      <p className="text-sm text-white/40 mt-1">
                        {new Date(order.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Notes</h2>
              </div>
              <p className="text-white/70 whitespace-pre-wrap">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Box className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Gestion du statut</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2 block">
                  Statut de la commande
                </label>
                <Select
                  value={order.status}
                  onValueChange={updateOrderStatus}
                  disabled={updating}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem 
                          key={key} 
                          value={key}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} className={config.color.split(' ')[1]} />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2 block">
                  Statut du paiement
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={order.paid ? "default" : "outline"}
                    className={order.paid 
                      ? "flex-1 bg-emerald-500 hover:bg-emerald-600" 
                      : "flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                    }
                    onClick={() => updatePaymentStatus(true)}
                    disabled={updating || order.paid}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Payée
                  </Button>
                  <Button
                    variant={!order.paid ? "default" : "outline"}
                    className={!order.paid 
                      ? "flex-1 bg-amber-500 hover:bg-amber-600" 
                      : "flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                    }
                    onClick={() => updatePaymentStatus(false)}
                    disabled={updating || !order.paid}
                  >
                    <Clock size={16} className="mr-2" />
                    En attente
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-400/10 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Client</h2>
            </div>
            
            <div className="space-y-4">
              {customerName && (
                <div className="flex items-center gap-3">
                  <User size={16} className="text-white/40" />
                  <span className="text-white">{customerName}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-white/40" />
                  <a href={`mailto:${customerEmail}`} className="text-amber-400 hover:text-amber-300 transition-colors">
                    {customerEmail}
                  </a>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-white/40" />
                  <a href={`tel:${customerPhone}`} className="text-amber-400 hover:text-amber-300 transition-colors">
                    {customerPhone}
                  </a>
                </div>
              )}
              {!customerName && !customerEmail && !customerPhone && (
                <p className="text-white/40 text-sm">Informations client non disponibles</p>
              )}
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-400/10 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Adresse de livraison</h2>
            </div>
            
            <div className="space-y-2 text-white/70">
              {order.deliveryAddress.street && (
                <p>{order.deliveryAddress.street}</p>
              )}
              <p>
                {order.deliveryAddress.city || 'N/A'}
                {order.deliveryAddress.postalCode && `, ${order.deliveryAddress.postalCode}`}
              </p>
              {order.deliveryAddress.country && (
                <p>{order.deliveryAddress.country}</p>
              )}
              {order.deliveryZone && (
                <p className="text-sm text-white/40 mt-2">Zone: {order.deliveryZone}</p>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  order.deliveryRequested 
                    ? 'bg-emerald-400/10 text-emerald-400' 
                    : 'bg-white/5 text-white/40'
                }`}>
                  <Truck size={12} />
                  {order.deliveryRequested ? 'Livraison demandée' : 'Retrait en magasin'}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-400/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Paiement</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/40">Méthode:</span>
                <span className="font-bold text-white">
                  {order.paymentMethod === 'COD' ? 'Paiement à la livraison' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40">Statut:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.paid 
                    ? 'bg-emerald-400/10 text-emerald-400' 
                    : 'bg-amber-400/10 text-amber-400'
                }`}>
                  {order.paid ? 'Payée' : 'En attente'}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Total:</span>
                  <span className="text-2xl font-black text-amber-400">{order.total.toLocaleString()} TND</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Hash className="w-5 h-5 text-white/60" />
              </div>
              <h2 className="text-lg font-bold text-white">Détails</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">ID Commande:</span>
                <span className="font-mono text-white">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Créée le:</span>
                <span className="text-white">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Mise à jour:</span>
                <span className="text-white">
                  {new Date(order.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hidden Invoice Template for Printing */}
      <div ref={invoiceRef} className="hidden" />
    </div>
  )
}

