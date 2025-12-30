import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  slug: string
  name: string
  subtitle?: string
  category: 'scooter' | 'accessory'
  isFeaturing: boolean
  color?: string
  type?: string
  enginePower?: number
  price: number
  description?: string
  technicalInfo: Array<{ label: string; value: string }>
  images: string[]
  videos: Array<{ muxAssetId: string; playbackId: string }>
  featuredMediaIndex?: number
  compatibility?: string[]
  stock: number
  isActive: boolean
  filterAttributes?: {
    colors?: string[]
    engineTypes?: string[]
    features?: string[]
    priceRange?: { min: number; max: number }
  }
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    category: {
      type: String,
      enum: ['scooter', 'accessory'],
      required: true,
    },
    isFeaturing: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
    },
    type: {
      type: String,
    },
    enginePower: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    technicalInfo: [
      {
        label: String,
        value: String,
        _id: false, // Disable _id for subdocuments
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    videos: [
      {
        muxAssetId: String,
        playbackId: String,
      },
    ],
    featuredMediaIndex: {
      type: Number,
    },
    compatibility: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    filterAttributes: {
      colors: [String],
      engineTypes: [String],
      features: [String],
      priceRange: {
        min: Number,
        max: Number,
      },
    },
  },
  {
    timestamps: true,
  }
)

// slug index is already created by unique: true
ProductSchema.index({ category: 1 })
ProductSchema.index({ isFeaturing: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ 'filterAttributes.colors': 1 })
ProductSchema.index({ enginePower: 1 })
ProductSchema.index({ type: 1 })

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product

