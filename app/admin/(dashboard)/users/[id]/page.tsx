'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Settings,
  Package,
  Shield,
  Ban,
  CheckCircle,
  Key,
  Hash,
  Save,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Order {
  _id: string
  orderId: string
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  createdAt: string
}

interface UserData {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  isActive: boolean
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  preferences?: {
    language?: string
    notifications?: boolean
  }
  orderHistory: Order[]
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  email: string
  phone: string
  role: 'customer' | 'admin'
  isActive: boolean
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  preferences: {
    language: string
    notifications: boolean
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-400' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-500/20 text-blue-400' },
  shipping: { label: 'En livraison', color: 'bg-purple-500/20 text-purple-400' },
  delivered: { label: 'Livrée', color: 'bg-emerald-500/20 text-emerald-400' },
  cancelled: { label: 'Annulée', color: 'bg-rose-500/20 text-rose-400' },
}

export default function EditUserPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    isActive: true,
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    preferences: {
      language: 'fr',
      notifications: true,
    },
  })

  // Fetch user data
  useEffect(() => {
    if (userId) {
      fetch(`/api/admin/users/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error('User not found')
          return res.json()
        })
        .then((data) => {
          const userData = data.user
          setUser(userData)
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'customer',
            isActive: userData.isActive ?? true,
            address: {
              street: userData.address?.street || '',
              city: userData.address?.city || '',
              postalCode: userData.address?.postalCode || '',
              country: userData.address?.country || '',
            },
            preferences: {
              language: userData.preferences?.language || 'fr',
              notifications: userData.preferences?.notifications ?? true,
            },
          })
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          toast.error('Utilisateur introuvable')
          router.push('/admin/users')
        })
    }
  }, [userId, router])

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateAddressField = (field: keyof FormData['address'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }))
  }

  const updatePreferencesField = <K extends keyof FormData['preferences']>(
    field: K,
    value: FormData['preferences'][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Le nom est requis'
    if (!formData.email.trim()) return "L'email est requis"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return "Format d'email invalide"
    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          role: formData.role,
          isActive: formData.isActive,
          address: {
            street: formData.address.street || undefined,
            city: formData.address.city || undefined,
            postalCode: formData.address.postalCode || undefined,
            country: formData.address.country || undefined,
          },
          preferences: {
            language: formData.preferences.language,
            notifications: formData.preferences.notifications,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      const data = await response.json()
      setUser(data.user)
      toast.success('Utilisateur mis à jour avec succès!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!showBanConfirm && formData.isActive) {
      setShowBanConfirm(true)
      return
    }

    setShowBanConfirm(false)
    const newIsActive = !formData.isActive
    updateField('isActive', newIsActive)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(newIsActive ? 'Compte réactivé' : 'Compte désactivé')
    } catch (err) {
      updateField('isActive', !newIsActive)
      toast.error('Erreur lors du changement de statut')
      console.error(err)
    }
  }

  const handlePasswordReset = async () => {
    setSendingReset(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      toast.success('Email de réinitialisation envoyé!')
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'email")
      console.error(err)
    } finally {
      setSendingReset(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Utilisateur supprimé avec succès!')
      router.push('/admin/users')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 lg:pb-8">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Supprimer ce compte ?</h3>
                <p className="text-white/60 text-sm">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir supprimer le compte de{' '}
              <span className="font-bold text-white">{formData.name}</span> ? Cette action ne
              peut pas être annulée.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                <Ban size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Désactiver ce compte ?</h3>
                <p className="text-white/60 text-sm">L&apos;utilisateur ne pourra plus se connecter</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir désactiver le compte de{' '}
              <span className="font-bold text-white">{formData.name}</span> ? Vous pourrez le
              réactiver ultérieurement.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBanConfirm(false)}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handleToggleActive}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                <Ban size={18} className="mr-2" />
                Désactiver
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 lg:py-8 text-white">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Link
            href="/admin/users"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux utilisateurs
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Modifier l&apos;utilisateur
              </h1>
              <p className="text-white/50 mt-2">
                {formData.name || 'Utilisateur'} • {formData.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => (formData.isActive ? setShowBanConfirm(true) : handleToggleActive())}
                className={`border-white/10 ${
                  formData.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Actif
                  </>
                ) : (
                  <>
                    <Ban size={18} className="mr-2" />
                    Désactivé
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400">
                  <UserIcon size={20} />
                </div>
                Informations de base
              </h2>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="text-sm font-bold text-white/60 mb-2 block">
                    Nom complet *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nom de l'utilisateur"
                    className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm font-bold text-white/60 mb-2 block">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                      size={18}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@exemple.com"
                      className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50 pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="text-sm font-bold text-white/60 mb-2 block">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                      size={18}
                    />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+216 XX XXX XXX"
                      className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50 pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Address Information Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
                  <MapPin size={20} />
                </div>
                Adresse
              </h2>

              <div className="space-y-5">
                {/* Street */}
                <div>
                  <label htmlFor="street" className="text-sm font-bold text-white/60 mb-2 block">
                    Rue
                  </label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => updateAddressField('street', e.target.value)}
                    placeholder="Numéro et nom de rue"
                    className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="text-sm font-bold text-white/60 mb-2 block">
                      Ville
                    </label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateAddressField('city', e.target.value)}
                      placeholder="Tunis"
                      className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="text-sm font-bold text-white/60 mb-2 block"
                    >
                      Code postal
                    </label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => updateAddressField('postalCode', e.target.value)}
                      placeholder="1000"
                      className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="text-sm font-bold text-white/60 mb-2 block">
                    Pays
                  </label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => updateAddressField('country', e.target.value)}
                    placeholder="Tunisie"
                    className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
              </div>
            </Card>

            {/* Preferences Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
                  <Settings size={20} />
                </div>
                Préférences
              </h2>

              <div className="space-y-5">
                {/* Language */}
                <div>
                  <label htmlFor="language" className="text-sm font-bold text-white/60 mb-2 block">
                    Langue
                  </label>
                  <select
                    id="language"
                    value={formData.preferences.language}
                    onChange={(e) => updatePreferencesField('language', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-amber-400/50"
                  >
                    <option value="fr" className="bg-slate-800">
                      Français
                    </option>
                    <option value="en" className="bg-slate-800">
                      English
                    </option>
                    <option value="ar" className="bg-slate-800">
                      العربية
                    </option>
                  </select>
                </div>

                {/* Notifications Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    updatePreferencesField('notifications', !formData.preferences.notifications)
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    formData.preferences.notifications
                      ? 'border-emerald-400/50 bg-emerald-400/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Mail
                      size={20}
                      className={
                        formData.preferences.notifications ? 'text-emerald-400' : 'text-white/40'
                      }
                    />
                    <div className="text-left">
                      <p className="font-bold text-white">Notifications email</p>
                      <p className="text-sm text-white/40">
                        Recevoir les mises à jour par email
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      formData.preferences.notifications ? 'bg-emerald-400' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </Card>

            {/* Order History Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                  <Package size={20} />
                </div>
                Historique des commandes
                <span className="ml-auto text-sm font-mono text-white/40">
                  {user?.orderHistory?.length || 0} commande(s)
                </span>
              </h2>

              {user?.orderHistory && user.orderHistory.length > 0 ? (
                <div className="space-y-3">
                  {user.orderHistory.map((order) => (
                    <Link
                      key={order._id}
                      href={`/admin/orders/${order._id}`}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-400/20 transition-colors">
                          <Package
                            size={18}
                            className="text-white/40 group-hover:text-amber-400 transition-colors"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-amber-400 transition-colors">
                            #{order.orderId}
                          </p>
                          <p className="text-xs text-white/40">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                            STATUS_CONFIG[order.status]?.color || 'bg-white/10 text-white/60'
                          }`}
                        >
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                        <span className="font-mono font-bold text-amber-400">
                          {order.total?.toLocaleString('fr-FR')} TND
                        </span>
                        <ExternalLink size={16} className="text-white/20 group-hover:text-white/60" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune commande</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Role Management Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                  <Shield size={18} />
                </div>
                Rôle
              </h2>

              <div className="space-y-3">
                <select
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value as 'customer' | 'admin')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="customer" className="bg-slate-800">
                    Client
                  </option>
                  <option value="admin" className="bg-slate-800">
                    Administrateur
                  </option>
                </select>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${
                    formData.role === 'admin'
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {formData.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                  {formData.role === 'admin' ? 'Administrateur' : 'Client'}
                </div>

                {formData.role === 'admin' && user?.role !== 'admin' && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-xs text-amber-400">
                      <AlertTriangle size={14} className="inline mr-1" />
                      Attention : cet utilisateur aura accès au panneau d&apos;administration.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Status Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    formData.isActive
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-rose-400/10 text-rose-400'
                  }`}
                >
                  {formData.isActive ? <CheckCircle size={18} /> : <Ban size={18} />}
                </div>
                Statut du compte
              </h2>

              <div className="space-y-3">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
                    formData.isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {formData.isActive ? (
                    <>
                      <CheckCircle size={16} />
                      Compte actif
                    </>
                  ) : (
                    <>
                      <Ban size={16} />
                      Compte désactivé
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    formData.isActive ? setShowBanConfirm(true) : handleToggleActive()
                  }
                  className={`w-full border-white/10 ${
                    formData.isActive
                      ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {formData.isActive ? (
                    <>
                      <Ban size={16} className="mr-2" />
                      Désactiver le compte
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Réactiver le compte
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Password Reset Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-400/10 text-rose-400">
                  <Key size={18} />
                </div>
                Mot de passe
              </h2>

              <p className="text-sm text-white/50 mb-4">
                Envoyez un email de réinitialisation du mot de passe à l&apos;utilisateur.
              </p>

              <Button
                variant="outline"
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                {sendingReset ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key size={16} className="mr-2" />
                )}
                Envoyer le lien de réinitialisation
              </Button>
            </Card>

            {/* Account Details Card */}
            <Card className="bg-white/5 border-white/10 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-white/60">
                  <Hash size={18} />
                </div>
                Détails du compte
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-white/40 mb-1">ID utilisateur</p>
                  <p className="font-mono text-white/70 bg-white/5 px-3 py-2 rounded-lg break-all">
                    {userId}
                  </p>
                </div>

                <div>
                  <p className="text-white/40 mb-1">Créé le</p>
                  <p className="text-white/70">
                    {user?.createdAt &&
                      new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </p>
                </div>

                <div>
                  <p className="text-white/40 mb-1">Dernière modification</p>
                  <p className="text-white/70">
                    {user?.updatedAt &&
                      new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </p>
                </div>

                <div>
                  <p className="text-white/40 mb-1">Total commandes</p>
                  <p className="font-mono font-bold text-amber-400">
                    {user?.orderHistory?.length || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-white/5 border-rose-500/30 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-3">
                <AlertTriangle size={20} />
                Zone de danger
              </h2>

              <p className="text-sm text-white/50 mb-4">
                Supprimer ce compte de façon permanente. Cette action est irréversible.
              </p>

              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={formData.role === 'admin'}
                className="w-full border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 disabled:opacity-50"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer ce compte
              </Button>

              {formData.role === 'admin' && (
                <p className="text-xs text-white/40 mt-3">
                  Impossible de supprimer un compte administrateur.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 lg:hidden z-50">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-14 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !!validateForm()}
            className="flex-1 h-14 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Action Bar */}
      <div className="hidden lg:block fixed bottom-8 right-8">
        <div className="flex gap-3 p-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-12 px-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !!validateForm()}
            className="h-12 px-8 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


