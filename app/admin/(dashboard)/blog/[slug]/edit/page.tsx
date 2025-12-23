'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { BlogForm } from '../../components/BlogForm'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface BlogPost {
  _id: string
  slug: string
  title: string
  description: string
  content: string
  image: string
  category: string
  tags: string[]
  author: {
    name: string
    role: string
  }
  isPublished: boolean
  publishedAt: string
}

export default function EditBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Fetch post data
  useEffect(() => {
    if (session?.user?.role === 'admin' && slug) {
      fetch(`/api/blog/${slug}?admin=true`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found')
          return res.json()
        })
        .then((data) => {
          setPost(data)
          setLoading(false)
        })
        .catch(() => {
          toast.error('Article introuvable')
          router.push('/admin/blog')
        })
    }
  }, [session, slug, router])

  // Delete handler
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Article supprimé avec succès')
        router.push('/admin/blog')
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header with back button and delete */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Link 
            href="/admin/blog" 
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux articles
          </Link>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Modifier l&apos;Article
          </h1>
          <p className="text-white/60 mt-2">
            Modification de &quot;{post.title}&quot;
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 size={16} className="mr-2" />
          Supprimer
        </Button>
      </div>

      {/* Form */}
      <BlogForm 
        mode="edit"
        initialData={post}
        onSuccess={() => {
          toast.success('Article mis à jour avec succès!')
          router.push('/admin/blog')
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Supprimer l&apos;article ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Cette action est irréversible. L&apos;article &quot;{post.title}&quot; sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              disabled={deleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

