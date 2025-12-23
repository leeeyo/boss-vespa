'use client'

import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Package, 
  Loader2, 
  LogOut, 
  Lock,
  Eye,
  EyeOff,
  Shield,
  SlidersHorizontal
} from 'lucide-react'
import Link from 'next/link'

export default function SecurityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [prevSessionEmail, setPrevSessionEmail] = useState<string | null>(null)
  const [userData, setUserData] = useState({ name: '', email: '' })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      })
      return
    }

    setPasswordLoading(true)
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          email: userData.email,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Mot de passe modifié',
          description: 'Votre mot de passe a été mis à jour avec succès.',
        })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        const data = await res.json()
        toast({
          title: 'Erreur',
          description: data.error || 'Impossible de modifier le mot de passe.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setPasswordLoading(false)
    }
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
                Sécurité
              </h1>
              <p className="text-white/60">Protégez votre compte avec un mot de passe sécurisé.</p>
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
                  <Link href="/profile/preferences" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 transition-all">
                    <SlidersHorizontal size={18} />
                    Préférences
                  </Link>
                  <Link href="/profile/security" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-400 text-black font-bold transition-all">
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
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Lock className="w-6 h-6 text-amber-400" />
                    Modifier le mot de passe
                  </CardTitle>
                  <CardDescription className="text-white/50">Choisissez un mot de passe fort pour sécuriser votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white/70">Mot de passe actuel</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="bg-white/5 border-white/10 text-white pl-10 pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white/70">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="bg-white/5 border-white/10 text-white pl-10 pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-white/40">Minimum 8 caractères</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/70">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="bg-white/5 border-white/10 text-white pl-10 pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold h-12 mt-4"
                      disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    >
                      {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Modifier le mot de passe'}
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

