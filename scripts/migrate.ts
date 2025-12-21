import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file explicitly
config({ path: resolve(process.cwd(), '.env.local') })

import connectDB from '../lib/mongodb'
import Product from '../models/Product'
import Blog from '../models/Blog'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import { vespaProducts } from '../data/vespa'
import { blogPosts } from '../data/blog'

async function migrateProducts() {
  console.log('Migrating products...')
  
  for (const product of vespaProducts) {
    // Extract engine power from specs
    let enginePower: number | undefined
    const engineSpec = product.specs.find((s) => s.label === 'Moteur')
    if (engineSpec) {
      const match = engineSpec.value.match(/(\d+)\s*cc/)
      if (match) {
        enginePower = parseInt(match[1])
      }
    }

    // Extract type from name
    let type: string | undefined
    if (product.name.includes('Primavera')) {
      type = 'Primavera'
    } else if (product.name.includes('Sprint')) {
      type = 'Sprint'
    } else if (product.name.includes('GTS')) {
      type = 'GTS'
    }

    // Extract price as number
    const price = parseInt(product.price.replace(/\s/g, '').replace('TND', ''))

    const productData = {
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      isFeaturing: false,
      color: product.color,
      type,
      enginePower,
      price,
      description: product.description,
      technicalInfo: product.specs,
      images: product.images,
      videos: [],
      compatibility: product.category === 'accessory' ? product.specs.find((s) => s.label === 'Compatibilité')?.value.split(',').map((c: string) => c.trim()) : undefined,
      stock: 0,
      isActive: true,
    }

    try {
      const existingProduct = await Product.findOne({ slug: product.slug })
      if (existingProduct) {
        console.log(`Product ${product.slug} already exists, skipping...`)
        continue
      }

      await Product.create(productData)
      console.log(`Migrated product: ${product.name}`)
    } catch (error) {
      console.error(`Error migrating product ${product.slug}:`, error)
    }
  }

  console.log('Products migration completed!')
}

async function migrateBlogPosts() {
  console.log('Migrating blog posts...')

  for (const post of blogPosts) {
    const blogData = {
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content.trim(),
      image: post.image,
      videos: [],
      category: post.category,
      tags: post.tags,
      author: post.author,
      publishedAt: new Date(post.publishedAt),
      updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
      isPublished: true,
      views: 0,
    }

    try {
      const existingPost = await Blog.findOne({ slug: post.slug })
      if (existingPost) {
        console.log(`Blog post ${post.slug} already exists, skipping...`)
        continue
      }

      await Blog.create(blogData)
      console.log(`Migrated blog post: ${post.title}`)
    } catch (error) {
      console.error(`Error migrating blog post ${post.slug}:`, error)
    }
  }

  console.log('Blog posts migration completed!')
}

async function createAdminUser() {
  console.log('Creating admin user...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@boss-vespa.tn'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    const existingAdmin = await User.findOne({ email: adminEmail })
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    })

    console.log(`Admin user created: ${adminEmail}`)
    console.log(`Default password: ${adminPassword}`)
    console.log('⚠️  Please change the default password after first login!')
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

async function migrate() {
  try {
    // connectDB() reads MONGODB_URI from process.env automatically
    await connectDB()
    console.log('Connected to MongoDB')

    await migrateProducts()
    await migrateBlogPosts()
    await createAdminUser()

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
