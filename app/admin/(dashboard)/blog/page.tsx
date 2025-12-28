'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Loader2,
  Calendar,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface BlogPost {
  _id: string
  title: string
  slug: string
  author: {
    name: string
  }
  isPublished: boolean
  publishedAt: string
  image: string
  views: number
  category: string
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession()  
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ slug: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  const fetchPosts = () => {
    if (session?.user?.role === 'admin') {
      fetch('/api/blog?admin=true')
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.posts || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [session])

  const handleDelete = async () => {
    if (!deleteConfirm) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/blog/${deleteConfirm.slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Article supprimé avec succès')
      setDeleteConfirm(null)
      // Refresh posts list
      fetchPosts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'article')
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Supprimer cet article ?</h3>
                <p className="text-white/60 text-sm">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-bold text-white">{deleteConfirm.title}</span> ? 
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Gestion du Blog
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input 
              placeholder="Rechercher un article..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 focus:ring-amber-400/20"
            />
          </div>
          <Link href="/admin/blog/new">
            <Button className="bg-amber-400 text-black hover:bg-amber-300 font-bold">
              <Plus size={18} className="mr-2" />
              Nouvel Article
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post._id} className="bg-white/5 border-white/10 overflow-hidden hover:border-amber-400/30 transition-all group">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                  <div className="relative h-32 w-full md:w-48 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    {post.image ? (
                      <Image 
                        src={post.image} 
                        alt={post.title} 
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <FileText size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${post.isPublished ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {post.isPublished ? 'Publié' : 'Brouillon'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 py-2">
                    <div className="flex items-center gap-3 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
                      <span>{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.views} vues
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/40 text-xs">
                      <div className="flex items-center gap-1">
                        <UserIcon size={14} />
                        {post.author?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.publishedAt || new Date().toISOString()).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/admin/blog/${post.slug}/edit`}>
                      <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-4">
                        <Edit2 size={16} className="mr-2" />
                        Editer
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="px-3 border-white/10 bg-white/5 hover:bg-rose-500/20 text-rose-400 h-10"
                      onClick={() => setDeleteConfirm({ slug: post.slug, title: post.title })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucun article trouvé</h3>
            <p className="text-white/40">Commencez par rédiger votre premier article de blog.</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

