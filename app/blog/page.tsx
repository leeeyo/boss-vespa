import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { getAllBlogPosts } from '@/lib/blog'
import { generateMetadata as genMeta } from '@/lib/seo'
import { Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = genMeta({
  title: 'Blog',
  description: 'Découvrez nos articles sur les Vespas : guides d\'achat, conseils d\'entretien, tendances de personnalisation et actualités Boss Vespa.',
  path: '/blog',
  image: '/images/showcase1.jpg',
  type: 'website',
})

export default async function BlogPage() {
  const posts = await getAllBlogPosts().catch((error) => {
    console.error('Error fetching blog posts:', error)
    return []
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent py-2">
              Blog Boss Vespa
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Guides, conseils et actualités sur les Vespas en Tunisie
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:gap-12">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <Link href={`/blog/${post.slug}`} className="block" aria-label={`Lire l'article: ${post.title}`}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Image */}
                    <div className="relative aspect-video md:aspect-square overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-amber-400 transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-white/70 mb-4 line-clamp-3">
                          {post.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="flex items-center text-amber-400 font-semibold group-hover:gap-2 transition-all" aria-hidden="true">
                        Lire l&apos;article
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

