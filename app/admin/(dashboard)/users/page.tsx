'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Shield, 
  User as UserIcon, 
  Mail, 
  ArrowLeft,
  Loader2,
  Ban,
  Edit2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface User {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  isActive: boolean
  createdAt: string
  orderHistory: string[]
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [banConfirmUser, setBanConfirmUser] = useState<User | null>(null)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (session?.user?.role === 'admin') {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [session])

  const handleToggleUserStatus = async (user: User, skipConfirm = false) => {
    // If user is active, show confirmation dialog first
    if (user.isActive && !skipConfirm) {
      setBanConfirmUser(user)
      return
    }

    setBanConfirmUser(null)
    setTogglingStatus(user._id)
    const newIsActive = !user.isActive

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u._id === user._id ? { ...u, isActive: newIsActive } : u
        )
      )
      toast.success(newIsActive ? 'Compte réactivé' : 'Compte désactivé')
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Erreur lors du changement de statut')
    } finally {
      setTogglingStatus(null)
    }
  }


  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Ban Confirmation Modal */}
      {banConfirmUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Désactiver ce compte ?</h3>
                <p className="text-white/60 text-sm">L&apos;utilisateur ne pourra plus se connecter</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir désactiver le compte de{' '}
              <span className="font-bold text-white">{banConfirmUser.name}</span> ? Vous pourrez le
              réactiver ultérieurement.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setBanConfirmUser(null)}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={() => handleToggleUserStatus(banConfirmUser, true)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                <Ban size={18} className="mr-2" />
                Désactiver
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input 
              placeholder="Rechercher un utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 focus:ring-amber-400/20"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Inscrit le</th>
                <th className="px-6 py-4 text-center">Commandes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-400 font-bold border border-amber-400/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{user.name}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <Mail size={10} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'}`}>
                      {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {user.isActive !== false ? <CheckCircle size={10} /> : <Ban size={10} />}
                      {user.isActive !== false ? 'Actif' : 'Désactivé'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-amber-400">{user.orderHistory?.length || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${user._id}`}>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-amber-400 hover:bg-amber-400/10">
                          <Edit2 size={14} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className={`h-8 w-8 p-0 ${user.isActive !== false ? 'text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={togglingStatus === user._id}
                      >
                        {togglingStatus === user._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : user.isActive !== false ? (
                          <Ban size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

