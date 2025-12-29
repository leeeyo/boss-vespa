import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog'
import { generateMetadata as genMeta } from '@/lib/seo'
import { generateStructuredData } from '@/lib/seo'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StructuredData } from '@/components/structured-data'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return genMeta({
      title: 'Article non trouvé',
      description: 'L\'article demandé est introuvable.',
      path: `/blog/${slug}`,
      noindex: true,
    })
  }

  return genMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    image: post.image,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const articleSchema = generateStructuredData('Article', {
    title: post.title,
    description: post.description,
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boss-vespa.tn'}${post.image}`,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
    },
  })

  return (
    <>
      <StructuredData data={articleSchema} />
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
        <Navigation />

        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { name: 'Blog', url: '/blog' },
                { name: post.title, url: `/blog/${post.slug}` },
              ]}
            />

            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-8 text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
              </Button>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
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

              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
                {post.title}
              </h1>

              <p className="text-xl text-white/80 mb-6">
                {post.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>Par {post.author.name}</span>
                <span>•</span>
                <span>{post.author.role}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-white/10">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 896px, 100vw"
                priority
              />
            </div>

            {/* Content */}
            <article className="markdown-content text-white/90 leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-4xl font-black mb-6 mt-0 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-3xl font-bold mb-4 mt-10 text-amber-400">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-2xl font-semibold mb-3 mt-6 text-white">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed text-white/90">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 pl-6 space-y-2 text-white/90">{children}</ul>,
                  li: ({ children }) => <li className="mb-2">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-amber-400 hover:underline">{children}</a>
                  ),
                  code: ({ children }) => (
                    <code className="text-amber-300 bg-white/10 px-1 py-0.5 rounded text-sm">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-400 pl-4 italic text-white/80 my-4">{children}</blockquote>
                  ),
                }}
              >
                {post.content.trim()}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="text-sm text-white/60 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

