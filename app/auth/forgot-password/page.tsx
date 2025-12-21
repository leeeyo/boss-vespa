'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email')
      }

      setSubmitted(true)
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erreur',
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
          {!submitted ? (
            <>
              <CardHeader className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mb-2">
                  <Lock className="text-amber-400 w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-black text-white">
                  Mot de passe oublié ?
                </CardTitle>
                <CardDescription className="text-white/60">
                  Entrez votre email pour recevoir un lien de récupération
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-base transition-all active:scale-[0.98]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le lien
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="text-emerald-500 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Vérifiez vos emails</h3>
                <p className="text-white/60">
                  Si un compte existe pour <span className="text-white font-medium">{email}</span>, 
                  un lien de réinitialisation vous a été envoyé.
                </p>
              </div>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                Essayer un autre email
              </Button>
            </div>
          )}
          
          <CardFooter className="bg-white/5 py-4 flex justify-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

