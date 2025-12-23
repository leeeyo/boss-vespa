'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Palette, 
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface Personalization {
  _id: string
  color: string
  type: string
  enginePower: number
  status: 'pending' | 'processed' | 'cancelled'
  createdAt: string
  userEmail?: string
}

export default function AdminPersonalizationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Personalization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/personalization')
        .then((res) => res.json())
        .then((data) => {
          setItems(data.personalizations || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Demandes de Personnalisation
          </h1>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Card key={item._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all overflow-hidden">
              <div className="flex items-center p-6 gap-6">
                <div 
                  className="w-16 h-16 rounded-2xl shadow-2xl border border-white/10 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Palette className={`w-8 h-8 ${parseInt(item.color.replace('#', ''), 16) > 0xffffff / 2 ? 'text-black' : 'text-white'}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">Vespa {item.type}</h3>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                      {item.enginePower}cc
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-white/40 text-xs">
                    <p className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {item.userEmail && (
                      <p className="flex items-center gap-1">
                        <ExternalLink size={12} />
                        {item.userEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${
                    item.status === 'pending' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 
                    item.status === 'processed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                    'bg-rose-400/10 text-rose-400 border-rose-400/20'
                  }`}>
                    {item.status === 'pending' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    {item.status === 'pending' ? 'En attente' : item.status === 'processed' ? 'Traitée' : 'Annulée'}
                  </div>
                  
                  <Button variant="ghost" className="text-white/40 hover:text-white">
                    <MoreVertical size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucune demande de personnalisation</h3>
            <p className="text-white/40">Les demandes apparaîtront ici dès qu&apos;un client personnalise sa Vespa.</p>
          </div>
        )}
      </div>
    </div>
  )
}

