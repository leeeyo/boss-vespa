'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Phone, MapPin, Package, Heart, Settings, Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '', // These would normally be fetched from a /api/user/profile route
        address: {
          street: '',
          city: '',
          postalCode: '',
        }
      })
    }
  }, [session])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // In a real app, you'd call an API here
    setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      })
    }, 1000)
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
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                Mon Profil
              </h1>
              <p className="text-white/60">Gérez vos informations personnelles et vos commandes.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
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
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-400 text-black font-bold transition-all">
                    <User size={18} />
                    Informations personnelles
                  </Link>
                  <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <Package size={18} />
                    Mes commandes
                  </Link>
                  <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <Heart size={18} />
                    Ma liste de souhaits
                  </Link>
                  <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <Settings size={18} />
                    Paramètres
                  </Link>
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-white/5 border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Détails du compte</CardTitle>
                  <CardDescription className="text-white/50">Mettez à jour vos coordonnées pour faciliter vos prochaines livraisons.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/70">Nom complet</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <Input 
                            id="name" 
                            value={userData.name} 
                            onChange={(e) => setUserData({...userData, name: e.target.value})}
                            className="bg-white/5 border-white/10 text-white pl-10" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/70">Email (non modifiable)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <Input 
                            id="email" 
                            value={userData.email} 
                            disabled 
                            className="bg-white/5 border-white/10 text-white/40 pl-10 cursor-not-allowed" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/70">Téléphone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <Input 
                            id="phone" 
                            value={userData.phone} 
                            onChange={(e) => setUserData({...userData, phone: e.target.value})}
                            placeholder="+216 -- --- ---"
                            className="bg-white/5 border-white/10 text-white pl-10" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-amber-400" size={18} />
                        Adresse de livraison par défaut
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-white/70">Rue et numéro</Label>
                          <Input 
                            id="street" 
                            value={userData.address.street} 
                            onChange={(e) => setUserData({...userData, address: {...userData.address, street: e.target.value}})}
                            className="bg-white/5 border-white/10 text-white" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-white/70">Ville</Label>
                            <Input 
                              id="city" 
                              value={userData.address.city} 
                              onChange={(e) => setUserData({...userData, address: {...userData.address, city: e.target.value}})}
                              className="bg-white/5 border-white/10 text-white" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-white/70">Code Postal</Label>
                            <Input 
                              id="postalCode" 
                              value={userData.address.postalCode} 
                              onChange={(e) => setUserData({...userData, address: {...userData.address, postalCode: e.target.value}})}
                              className="bg-white/5 border-white/10 text-white" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold h-12 shadow-xl shadow-amber-500/10"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer les modifications'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

