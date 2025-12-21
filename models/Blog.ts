import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId
  slug: string
  title: string
  description?: string
  content: string
  image?: string
  videos: Array<{ muxAssetId: string; playbackId: string }>
  category?: string
  tags: string[]
  author: {
    name: string
    role: string
  }
  publishedAt?: Date
  updatedAt: Date
  isPublished: boolean
  views: number
  createdAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    videos: [
      {
        muxAssetId: String,
        playbackId: String,
      },
    ],
    category: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    author: {
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
    publishedAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// slug index is already created by unique: true
BlogSchema.index({ isPublished: 1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ tags: 1 })

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema)

export default Blog

