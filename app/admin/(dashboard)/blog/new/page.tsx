'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BlogForm } from '../components/BlogForm'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header with back button */}
      <div className="mb-8">
        <Link 
          href="/admin/blog" 
          className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux articles
        </Link>
        <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Nouvel Article
        </h1>
        <p className="text-white/60 mt-2">
          Rédigez et publiez un nouvel article de blog
        </p>
      </div>

      {/* Form */}
      <BlogForm 
        mode="create"
        onSuccess={() => {
          toast.success('Article créé avec succès!')
          router.push('/admin/blog')
        }}
      />
    </div>
  )
}

