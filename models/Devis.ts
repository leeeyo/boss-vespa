import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IDevis extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  productId?: mongoose.Types.ObjectId
  message?: string
  media: string[]
  status: 'pending' | 'contacted' | 'quoted' | 'closed'
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const DevisSchema = new Schema<IDevis>(
  {
    name: {
      type: String,
      required: true,
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
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    message: {
      type: String,
    },
    media: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'contacted', 'quoted', 'closed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

DevisSchema.index({ status: 1 })
DevisSchema.index({ createdAt: -1 })
DevisSchema.index({ email: 1 })

const Devis: Model<IDevis> = mongoose.models.Devis || mongoose.model<IDevis>('Devis', DevisSchema)

export default Devis

