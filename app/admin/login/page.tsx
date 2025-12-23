'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginAction } from './actions'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 p-4">
      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Connexion Admin</CardTitle>
          <CardDescription className="text-white/60">Boss Vespa - Administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-white/10 border-white/20 text-white"
                placeholder="admin@boss-vespa.tn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Mot de passe
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

