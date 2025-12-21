'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return toast({
        title: 'Erreur de validation',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      })
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      toast({
        title: 'Compte créé !',
        description: 'Vous pouvez maintenant vous connecter.',
      })
      
      router.push('/auth/login')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erreur d\'inscription',
        description: err instanceof Error ? err.message : 'Une erreur est survenue.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]" />
        
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-black bg-linear-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
              Inscription
            </CardTitle>
            <CardDescription className="text-white/60">
              Rejoignez la communauté Boss Vespa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 font-medium">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="name"
                    placeholder="Aziz Vespa"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/90 font-medium text-sm">
                    Confirmer
                  </Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-base shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] mt-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
            <p className="text-sm text-white/60 text-center">
              Déjà un compte ?{' '}
              <Link 
                href="/auth/login" 
                className="text-amber-400 hover:text-amber-300 transition-colors font-bold"
              >
                Connectez-vous
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

