'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  Building2,
  Mail,
  CreditCard,
  Truck,
  Globe,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Plus,
  Trash2,
  Receipt,
  Percent,
  X
} from 'lucide-react'

interface ShippingZone {
  _id?: string
  name: string
  regions: string[]
  isActive: boolean
  flatRate: number
  freeShippingMinimum: number
  estimatedDays: string
}

interface Settings {
  siteInfo: {
    siteName: string
    siteDescription: string
    contactEmail: string
    contactPhone: string
    address: string
    city: string
    postalCode: string
    country: string
    socialLinks: {
      facebook: string
      instagram: string
      twitter: string
      youtube: string
      tiktok: string
      linkedin: string
    }
    logo: string
    favicon: string
  }
  emailSettings: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    smtpSecure: boolean
    fromName: string
    fromEmail: string
    replyToEmail: string
    orderConfirmationEnabled: boolean
    shippingNotificationEnabled: boolean
    marketingEmailsEnabled: boolean
  }
  paymentSettings: {
    currency: string
    currencySymbol: string
    enableCOD: boolean
    enableBankTransfer: boolean
    bankDetails: {
      bankName: string
      accountName: string
      accountNumber: string
      iban: string
      swift: string
    }
    enableStripe: boolean
    stripePublicKey: string
    stripeSecretKey: string
    enablePaypal: boolean
    paypalClientId: string
    paypalClientSecret: string
  }
  shippingSettings: {
    defaultWeight: number
    weightUnit: 'kg' | 'g' | 'lb'
    dimensionsUnit: 'cm' | 'm' | 'in'
    zones: ShippingZone[]
    tax: {
      enableTax: boolean
      taxRate: number
      taxName: string
      taxIncludedInPrice: boolean
      taxRegistrationNumber: string
    }
  }
}

const defaultSettings: Settings = {
  siteInfo: {
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Tunisie',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      linkedin: '',
    },
    logo: '',
    favicon: '',
  },
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    orderConfirmationEnabled: true,
    shippingNotificationEnabled: true,
    marketingEmailsEnabled: false,
  },
  paymentSettings: {
    currency: 'TND',
    currencySymbol: 'TND',
    enableCOD: true,
    enableBankTransfer: true,
    bankDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      iban: '',
      swift: '',
    },
    enableStripe: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    enablePaypal: false,
    paypalClientId: '',
    paypalClientSecret: '',
  },
  shippingSettings: {
    defaultWeight: 1,
    weightUnit: 'kg',
    dimensionsUnit: 'cm',
    zones: [],
    tax: {
      enableTax: true,
      taxRate: 19,
      taxName: 'TVA',
      taxIncludedInPrice: true,
      taxRegistrationNumber: '',
    },
  },
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('site-info')
  const [newRegion, setNewRegion] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchSettings()
    }
  }, [session, fetchSettings])

  const saveSettings = async (section: string, data: Partial<Settings[keyof Settings]>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      })
      
      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast.success('Paramètres enregistrés avec succès')
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addShippingZone = () => {
    const newZone: ShippingZone = {
      name: 'Nouvelle zone',
      regions: [],
      isActive: true,
      flatRate: 10,
      freeShippingMinimum: 0,
      estimatedDays: '3-5',
    }
    setSettings({
      ...settings,
      shippingSettings: {
        ...settings.shippingSettings,
        zones: [...settings.shippingSettings.zones, newZone],
      },
    })
  }

  const removeShippingZone = (index: number) => {
    setSettings({
      ...settings,
      shippingSettings: {
        ...settings.shippingSettings,
        zones: settings.shippingSettings.zones.filter((_, i) => i !== index),
      },
    })
  }

  const updateShippingZone = (index: number, field: keyof ShippingZone, value: unknown) => {
    const updatedZones = [...settings.shippingSettings.zones]
    updatedZones[index] = { ...updatedZones[index], [field]: value }
    setSettings({
      ...settings,
      shippingSettings: {
        ...settings.shippingSettings,
        zones: updatedZones,
      },
    })
  }

  const addRegionToZone = (zoneIndex: number) => {
    const region = newRegion[zoneIndex]
    if (!region?.trim()) return
    
    const updatedZones = [...settings.shippingSettings.zones]
    if (!updatedZones[zoneIndex].regions.includes(region.trim())) {
      updatedZones[zoneIndex].regions = [...updatedZones[zoneIndex].regions, region.trim()]
      setSettings({
        ...settings,
        shippingSettings: {
          ...settings.shippingSettings,
          zones: updatedZones,
        },
      })
    }
    setNewRegion({ ...newRegion, [zoneIndex]: '' })
  }

  const removeRegionFromZone = (zoneIndex: number, regionIndex: number) => {
    const updatedZones = [...settings.shippingSettings.zones]
    updatedZones[zoneIndex].regions = updatedZones[zoneIndex].regions.filter((_, i) => i !== regionIndex)
    setSettings({
      ...settings,
      shippingSettings: {
        ...settings.shippingSettings,
        zones: updatedZones,
      },
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
          <p className="font-medium">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/dashboard" 
          className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour au tableau de bord
        </Link>
        <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Paramètres
        </h1>
        <p className="text-white/50 mt-2">
          Configurez votre boutique Boss Vespa
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl inline-flex flex-wrap gap-1">
          <TabsTrigger 
            value="site-info" 
            className="data-[state=active]:bg-amber-400 data-[state=active]:text-slate-900 text-white/70 hover:text-white px-4 py-2 rounded-lg transition-all"
          >
            <Building2 size={16} className="mr-2" />
            Site Info
          </TabsTrigger>
          <TabsTrigger 
            value="email" 
            className="data-[state=active]:bg-amber-400 data-[state=active]:text-slate-900 text-white/70 hover:text-white px-4 py-2 rounded-lg transition-all"
          >
            <Mail size={16} className="mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="data-[state=active]:bg-amber-400 data-[state=active]:text-slate-900 text-white/70 hover:text-white px-4 py-2 rounded-lg transition-all"
          >
            <CreditCard size={16} className="mr-2" />
            Paiement
          </TabsTrigger>
          <TabsTrigger 
            value="shipping" 
            className="data-[state=active]:bg-amber-400 data-[state=active]:text-slate-900 text-white/70 hover:text-white px-4 py-2 rounded-lg transition-all"
          >
            <Truck size={16} className="mr-2" />
            Livraison & Taxes
          </TabsTrigger>
        </TabsList>

        {/* Site Info Tab */}
        <TabsContent value="site-info" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="text-amber-400" size={20} />
                Informations du site
              </CardTitle>
              <CardDescription className="text-white/50">
                Configurez les informations générales de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Nom du site
                  </label>
                  <Input
                    value={settings.siteInfo.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, siteName: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Boss Vespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Pays
                  </label>
                  <Input
                    value={settings.siteInfo.country}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, country: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Tunisie"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Description du site
                </label>
                <Textarea
                  value={settings.siteInfo.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteInfo: { ...settings.siteInfo, siteDescription: e.target.value }
                  })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                  placeholder="Description de votre boutique pour le SEO..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="text-amber-400" size={20} />
                Coordonnées
              </CardTitle>
              <CardDescription className="text-white/50">
                Informations de contact de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Email de contact
                  </label>
                  <Input
                    type="email"
                    value={settings.siteInfo.contactEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, contactEmail: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="contact@bossvespa.tn"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={settings.siteInfo.contactPhone}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, contactPhone: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Adresse
                </label>
                <Input
                  value={settings.siteInfo.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteInfo: { ...settings.siteInfo, address: e.target.value }
                  })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="Adresse complète"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Ville
                  </label>
                  <Input
                    value={settings.siteInfo.city}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, city: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Tunis"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Code postal
                  </label>
                  <Input
                    value={settings.siteInfo.postalCode}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, postalCode: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="text-amber-400" size={20} />
                Réseaux sociaux
              </CardTitle>
              <CardDescription className="text-white/50">
                Liens vers vos profils sur les réseaux sociaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Facebook size={14} /> Facebook
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.facebook}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, facebook: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://facebook.com/bossvespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Instagram size={14} /> Instagram
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.instagram}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, instagram: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://instagram.com/bossvespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Twitter size={14} /> Twitter / X
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.twitter}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, twitter: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://twitter.com/bossvespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Youtube size={14} /> YouTube
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.youtube}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, youtube: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://youtube.com/@bossvespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg> TikTok
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.tiktok}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, tiktok: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://tiktok.com/@bossvespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Linkedin size={14} /> LinkedIn
                  </label>
                  <Input
                    value={settings.siteInfo.socialLinks.linkedin}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteInfo: { 
                        ...settings.siteInfo, 
                        socialLinks: { ...settings.siteInfo.socialLinks, linkedin: e.target.value }
                      }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="https://linkedin.com/company/bossvespa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('siteInfo', settings.siteInfo)}
              disabled={saving}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg shadow-amber-900/20"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer les informations du site
            </Button>
          </div>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="text-amber-400" size={20} />
                Configuration SMTP
              </CardTitle>
              <CardDescription className="text-white/50">
                Paramètres de votre serveur d&apos;envoi d&apos;emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Hôte SMTP
                  </label>
                  <Input
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, smtpHost: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Port SMTP
                  </label>
                  <Input
                    type="number"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, smtpPort: parseInt(e.target.value) || 587 }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Utilisateur SMTP
                  </label>
                  <Input
                    value={settings.emailSettings.smtpUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, smtpUser: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Mot de passe SMTP
                  </label>
                  <Input
                    type="password"
                    value={settings.emailSettings.smtpPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, smtpPassword: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Connexion sécurisée (TLS/SSL)</p>
                  <p className="text-sm text-white/50">Activer le chiffrement des connexions SMTP</p>
                </div>
                <Switch
                  checked={settings.emailSettings.smtpSecure}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    emailSettings: { ...settings.emailSettings, smtpSecure: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="text-amber-400" size={20} />
                Paramètres d&apos;envoi
              </CardTitle>
              <CardDescription className="text-white/50">
                Configuration des emails sortants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Nom de l&apos;expéditeur
                  </label>
                  <Input
                    value={settings.emailSettings.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, fromName: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Boss Vespa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Email de l&apos;expéditeur
                  </label>
                  <Input
                    type="email"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, fromEmail: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="noreply@bossvespa.tn"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Email de réponse
                  </label>
                  <Input
                    type="email"
                    value={settings.emailSettings.replyToEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, replyToEmail: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="contact@bossvespa.tn"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="text-amber-400" size={20} />
                Notifications par email
              </CardTitle>
              <CardDescription className="text-white/50">
                Gérez les emails automatiques envoyés aux clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Confirmation de commande</p>
                  <p className="text-sm text-white/50">Envoyer un email après chaque commande</p>
                </div>
                <Switch
                  checked={settings.emailSettings.orderConfirmationEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    emailSettings: { ...settings.emailSettings, orderConfirmationEnabled: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Notification d&apos;expédition</p>
                  <p className="text-sm text-white/50">Notifier le client lors de l&apos;envoi de sa commande</p>
                </div>
                <Switch
                  checked={settings.emailSettings.shippingNotificationEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    emailSettings: { ...settings.emailSettings, shippingNotificationEnabled: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Emails marketing</p>
                  <p className="text-sm text-white/50">Autoriser l&apos;envoi de newsletters et promotions</p>
                </div>
                <Switch
                  checked={settings.emailSettings.marketingEmailsEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    emailSettings: { ...settings.emailSettings, marketingEmailsEnabled: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('emailSettings', settings.emailSettings)}
              disabled={saving}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg shadow-amber-900/20"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer les paramètres email
            </Button>
          </div>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="text-amber-400" size={20} />
                Devise
              </CardTitle>
              <CardDescription className="text-white/50">
                Configuration de la devise utilisée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Code devise
                  </label>
                  <Input
                    value={settings.paymentSettings.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, currency: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="TND"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Symbole
                  </label>
                  <Input
                    value={settings.paymentSettings.currencySymbol}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, currencySymbol: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="TND"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="text-amber-400" size={20} />
                Méthodes de paiement
              </CardTitle>
              <CardDescription className="text-white/50">
                Activez les méthodes de paiement disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Paiement à la livraison (COD)</p>
                  <p className="text-sm text-white/50">Les clients paient en espèces à la réception</p>
                </div>
                <Switch
                  checked={settings.paymentSettings.enableCOD}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    paymentSettings: { ...settings.paymentSettings, enableCOD: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Virement bancaire</p>
                  <p className="text-sm text-white/50">Paiement par virement avant expédition</p>
                </div>
                <Switch
                  checked={settings.paymentSettings.enableBankTransfer}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    paymentSettings: { ...settings.paymentSettings, enableBankTransfer: checked }
                  })}
                />
              </div>

              {settings.paymentSettings.enableBankTransfer && (
                <div className="pl-4 border-l-2 border-amber-400/30 space-y-4 mt-4">
                  <p className="text-sm font-bold text-amber-400">Coordonnées bancaires</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Nom de la banque
                      </label>
                      <Input
                        value={settings.paymentSettings.bankDetails.bankName}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { 
                            ...settings.paymentSettings, 
                            bankDetails: { ...settings.paymentSettings.bankDetails, bankName: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="Banque XYZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Nom du compte
                      </label>
                      <Input
                        value={settings.paymentSettings.bankDetails.accountName}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { 
                            ...settings.paymentSettings, 
                            bankDetails: { ...settings.paymentSettings.bankDetails, accountName: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="Boss Vespa SARL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Numéro de compte
                      </label>
                      <Input
                        value={settings.paymentSettings.bankDetails.accountNumber}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { 
                            ...settings.paymentSettings, 
                            bankDetails: { ...settings.paymentSettings.bankDetails, accountNumber: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        IBAN
                      </label>
                      <Input
                        value={settings.paymentSettings.bankDetails.iban}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { 
                            ...settings.paymentSettings, 
                            bankDetails: { ...settings.paymentSettings.bankDetails, iban: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="TN59 XXXX XXXX XXXX XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Code SWIFT/BIC
                      </label>
                      <Input
                        value={settings.paymentSettings.bankDetails.swift}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { 
                            ...settings.paymentSettings, 
                            bankDetails: { ...settings.paymentSettings.bankDetails, swift: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="XXXXTNXX"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="text-amber-400" size={20} />
                Passerelles de paiement en ligne
              </CardTitle>
              <CardDescription className="text-white/50">
                Configurer les paiements en ligne (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Stripe</p>
                      <p className="text-sm text-white/50">Paiements par carte bancaire</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.paymentSettings.enableStripe}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, enableStripe: checked }
                    })}
                  />
                </div>
                
                {settings.paymentSettings.enableStripe && (
                  <div className="pl-4 border-l-2 border-[#635BFF]/50 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Clé publique Stripe
                      </label>
                      <Input
                        value={settings.paymentSettings.stripePublicKey}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { ...settings.paymentSettings, stripePublicKey: e.target.value }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Clé secrète Stripe
                      </label>
                      <Input
                        type="password"
                        value={settings.paymentSettings.stripeSecretKey}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { ...settings.paymentSettings, stripeSecretKey: e.target.value }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PayPal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003087] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">PayPal</p>
                      <p className="text-sm text-white/50">Paiements via PayPal</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.paymentSettings.enablePaypal}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, enablePaypal: checked }
                    })}
                  />
                </div>
                
                {settings.paymentSettings.enablePaypal && (
                  <div className="pl-4 border-l-2 border-[#003087]/50 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Client ID PayPal
                      </label>
                      <Input
                        value={settings.paymentSettings.paypalClientId}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { ...settings.paymentSettings, paypalClientId: e.target.value }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
                        placeholder="AV..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Secret PayPal
                      </label>
                      <Input
                        type="password"
                        value={settings.paymentSettings.paypalClientSecret}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { ...settings.paymentSettings, paypalClientSecret: e.target.value }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('paymentSettings', settings.paymentSettings)}
              disabled={saving}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg shadow-amber-900/20"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer les paramètres de paiement
            </Button>
          </div>
        </TabsContent>

        {/* Shipping & Tax Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="text-amber-400" size={20} />
                Configuration des taxes
              </CardTitle>
              <CardDescription className="text-white/50">
                Paramètres de TVA et taxes applicables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="font-medium text-white">Activer les taxes</p>
                  <p className="text-sm text-white/50">Appliquer les taxes sur les commandes</p>
                </div>
                <Switch
                  checked={settings.shippingSettings.tax.enableTax}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    shippingSettings: { 
                      ...settings.shippingSettings, 
                      tax: { ...settings.shippingSettings.tax, enableTax: checked }
                    }
                  })}
                />
              </div>

              {settings.shippingSettings.tax.enableTax && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Nom de la taxe
                      </label>
                      <Input
                        value={settings.shippingSettings.tax.taxName}
                        onChange={(e) => setSettings({
                          ...settings,
                          shippingSettings: { 
                            ...settings.shippingSettings, 
                            tax: { ...settings.shippingSettings.tax, taxName: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="TVA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Taux (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.shippingSettings.tax.taxRate}
                        onChange={(e) => setSettings({
                          ...settings,
                          shippingSettings: { 
                            ...settings.shippingSettings, 
                            tax: { ...settings.shippingSettings.tax, taxRate: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="19"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        N° identification fiscale
                      </label>
                      <Input
                        value={settings.shippingSettings.tax.taxRegistrationNumber}
                        onChange={(e) => setSettings({
                          ...settings,
                          shippingSettings: { 
                            ...settings.shippingSettings, 
                            tax: { ...settings.shippingSettings.tax, taxRegistrationNumber: e.target.value }
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        placeholder="XXXXXXX/X/X/X"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-medium text-white">Prix TTC</p>
                      <p className="text-sm text-white/50">Les prix affichés incluent déjà les taxes</p>
                    </div>
                    <Switch
                      checked={settings.shippingSettings.tax.taxIncludedInPrice}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        shippingSettings: { 
                          ...settings.shippingSettings, 
                          tax: { ...settings.shippingSettings.tax, taxIncludedInPrice: checked }
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="text-amber-400" size={20} />
                  Zones de livraison
                </CardTitle>
                <CardDescription className="text-white/50">
                  Configurez les tarifs par zone géographique
                </CardDescription>
              </div>
              <Button
                onClick={addShippingZone}
                variant="outline"
                className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
              >
                <Plus size={16} className="mr-2" />
                Ajouter une zone
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.shippingSettings.zones.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <Truck className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/50">Aucune zone de livraison configurée</p>
                  <p className="text-sm text-white/30 mt-1">Ajoutez des zones pour définir vos tarifs de livraison</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.shippingSettings.zones.map((zone, index) => (
                    <div key={zone._id || index} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={zone.isActive}
                            onCheckedChange={(checked) => updateShippingZone(index, 'isActive', checked)}
                          />
                          <Input
                            value={zone.name}
                            onChange={(e) => updateShippingZone(index, 'name', e.target.value)}
                            className="bg-transparent border-none text-white font-bold text-lg h-auto p-0 focus-visible:ring-0"
                            placeholder="Nom de la zone"
                          />
                        </div>
                        <Button
                          onClick={() => removeShippingZone(index)}
                          variant="ghost"
                          size="sm"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                              Tarif fixe ({settings.paymentSettings.currencySymbol})
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={zone.flatRate}
                              onChange={(e) => updateShippingZone(index, 'flatRate', parseFloat(e.target.value) || 0)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                              Livraison gratuite dès ({settings.paymentSettings.currencySymbol})
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={zone.freeShippingMinimum}
                              onChange={(e) => updateShippingZone(index, 'freeShippingMinimum', parseFloat(e.target.value) || 0)}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="0 = pas de livraison gratuite"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                              Délai estimé (jours)
                            </label>
                            <Input
                              value={zone.estimatedDays}
                              onChange={(e) => updateShippingZone(index, 'estimatedDays', e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="3-5"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            Régions couvertes
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {zone.regions.map((region, regionIndex) => (
                              <span 
                                key={regionIndex}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-sm text-amber-400"
                              >
                                {region}
                                <button
                                  onClick={() => removeRegionFromZone(index, regionIndex)}
                                  className="hover:text-rose-400 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newRegion[index] || ''}
                              onChange={(e) => setNewRegion({ ...newRegion, [index]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && addRegionToZone(index)}
                              className="bg-white/5 border-white/10 text-white flex-1"
                              placeholder="Ajouter une région..."
                            />
                            <Button
                              onClick={() => addRegionToZone(index)}
                              variant="outline"
                              className="border-white/10 text-white hover:bg-white/10"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="text-amber-400" size={20} />
                Paramètres généraux d&apos;expédition
              </CardTitle>
              <CardDescription className="text-white/50">
                Unités de mesure par défaut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Poids par défaut
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.shippingSettings.defaultWeight}
                    onChange={(e) => setSettings({
                      ...settings,
                      shippingSettings: { ...settings.shippingSettings, defaultWeight: parseFloat(e.target.value) || 1 }
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Unité de poids
                  </label>
                  <div className="relative">
                    <select
                      value={settings.shippingSettings.weightUnit}
                      onChange={(e) => setSettings({
                        ...settings,
                        shippingSettings: { ...settings.shippingSettings, weightUnit: e.target.value as 'kg' | 'g' | 'lb' }
                      })}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/30"
                    >
                      <option value="kg" className="bg-slate-800">Kilogrammes (kg)</option>
                      <option value="g" className="bg-slate-800">Grammes (g)</option>
                      <option value="lb" className="bg-slate-800">Livres (lb)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Unité de dimensions
                  </label>
                  <div className="relative">
                    <select
                      value={settings.shippingSettings.dimensionsUnit}
                      onChange={(e) => setSettings({
                        ...settings,
                        shippingSettings: { ...settings.shippingSettings, dimensionsUnit: e.target.value as 'cm' | 'm' | 'in' }
                      })}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/30"
                    >
                      <option value="cm" className="bg-slate-800">Centimètres (cm)</option>
                      <option value="m" className="bg-slate-800">Mètres (m)</option>
                      <option value="in" className="bg-slate-800">Pouces (in)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('shippingSettings', settings.shippingSettings)}
              disabled={saving}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg shadow-amber-900/20"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer les paramètres de livraison
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

