'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
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
  Edit2
} from 'lucide-react'
import Link from 'next/link'

interface User {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  createdAt: string
  orderHistory: string[]
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchUsers() {
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
    fetchUsers()
  }, [session])


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
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-amber-400">{user.orderHistory?.length || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-white">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10">
                        <Ban size={14} />
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

