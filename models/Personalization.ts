import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IContactInfo {
  name: string
  email: string
  phone: string
  address?: string
}

export interface IPersonalization extends Document {
  _id: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  color: string
  vespaModel: string
  type?: string
  enginePower?: number
  selectedProductSlug?: string
  accessories: string[] // Array of product slugs
  contactInfo: IContactInfo
  deliveryPreference: 'pickup' | 'delivery'
  notes?: string
  status: 'pending' | 'contacted' | 'quoted' | 'approved' | 'rejected' | 'completed'
  adminNotes?: string
  estimatedPrice?: number
  finalPrice?: number
  createdAt: Date
  updatedAt: Date
}

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
  },
  { _id: false }
)

const PersonalizationSchema = new Schema<IPersonalization>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    color: {
      type: String,
      required: true,
    },
    vespaModel: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    enginePower: {
      type: Number,
    },
    selectedProductSlug: {
      type: String,
    },
    accessories: [
      {
        type: String,
      },
    ],
    contactInfo: {
      type: ContactInfoSchema,
      required: true,
    },
    deliveryPreference: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'quoted', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
    estimatedPrice: {
      type: Number,
    },
    finalPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

PersonalizationSchema.index({ userId: 1 })
PersonalizationSchema.index({ status: 1 })
PersonalizationSchema.index({ createdAt: -1 })
PersonalizationSchema.index({ 'contactInfo.email': 1 })

const Personalization: Model<IPersonalization> =
  mongoose.models.Personalization || mongoose.model<IPersonalization>('Personalization', PersonalizationSchema)

export default Personalization
