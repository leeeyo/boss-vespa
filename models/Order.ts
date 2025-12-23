import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  orderId: string
  userId: mongoose.Types.ObjectId
  items: Array<{
    productId: mongoose.Types.ObjectId
    quantity: number
    price: number
    name: string
  }>
  personalizationId?: mongoose.Types.ObjectId
  subtotal: number
  shippingCost: number
  total: number
  deliveryAddress: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  deliveryZone?: string
  deliveryRequested: boolean
  paid: boolean
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    personalizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Personalization',
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    deliveryZone: {
      type: String,
    },
    deliveryRequested: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order

