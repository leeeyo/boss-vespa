'use client'

import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Package, 
  Loader2, 
  LogOut, 
  Bell,
  Shield,
  SlidersHorizontal
} from 'lucide-react'
import Link from 'next/link'

export default function PreferencesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)

  const [prevSessionEmail, setPrevSessionEmail] = useState<string | null>(null)
  const [userData, setUserData] = useState({ name: '', email: '' })

  const [preferences, setPreferences] = useState({
    notifications: true,
    language: 'fr',
  })

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

  const handleSavePreferences = async () => {
    setLoading(true)
    // In a real app, you'd call an API here to save preferences
    setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Préférences enregistrées',
        description: 'Vos paramètres ont été mis à jour avec succès.',
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
                Préférences
              </h1>
              <p className="text-white/60">Personnalisez votre expérience sur notre site.</p>
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
                  <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <Package size={18} />
                    Mes commandes
                  </Link>
                  <Link href="/profile/preferences" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-400 text-black font-bold transition-all">
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
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Préférences</CardTitle>
                  <CardDescription className="text-white/50">Personnalisez votre expérience sur notre site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Notifications par email</p>
                        <p className="text-sm text-white/50">Recevez des mises à jour sur vos commandes</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                    />
                  </div>

                  <Button 
                    onClick={handleSavePreferences}
                    className="w-full bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold h-12"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer les préférences'}
                  </Button>
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

