import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IScooterListing extends Document {
  _id: mongoose.Types.ObjectId
  // Seller contact info
  name: string
  email: string
  phone: string
  location: string
  // Scooter details
  brand: string
  scooterModel: string
  year: number
  color: string
  // Condition
  mileage: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  // Details
  description?: string
  askingPrice: number
  images: string[]
  // Workflow status
  status: 'pending' | 'under_review' | 'negotiating' | 'purchased' | 'rejected'
  // Admin fields
  adminNotes?: string
  offeredPrice?: number
  createdAt: Date
  updatedAt: Date
}

const ScooterListingSchema = new Schema<IScooterListing>(
  {
    // Seller contact info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // Scooter details
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    scooterModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    // Condition
    mileage: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
    // Details
    description: {
      type: String,
    },
    askingPrice: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    // Workflow status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'negotiating', 'purchased', 'rejected'],
      default: 'pending',
    },
    // Admin fields
    adminNotes: {
      type: String,
    },
    offeredPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
ScooterListingSchema.index({ status: 1 })
ScooterListingSchema.index({ createdAt: -1 })
ScooterListingSchema.index({ email: 1 })
ScooterListingSchema.index({ brand: 1 })

const ScooterListing: Model<IScooterListing> =
  mongoose.models.ScooterListing || mongoose.model<IScooterListing>('ScooterListing', ScooterListingSchema)

export default ScooterListing

