import mongoose, { Schema, Model, Document } from 'mongoose'

// Site Info Settings
export interface ISiteInfo {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  postalCode: string
  country: string
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
    linkedin?: string
  }
  logo?: string
  favicon?: string
}

// Email Settings
export interface IEmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  fromName: string
  fromEmail: string
  replyToEmail: string
  orderConfirmationEnabled: boolean
  shippingNotificationEnabled: boolean
  marketingEmailsEnabled: boolean
}

// Payment Settings
export interface IPaymentSettings {
  currency: string
  currencySymbol: string
  enableCOD: boolean // Cash on Delivery
  enableBankTransfer: boolean
  bankDetails: {
    bankName: string
    accountName: string
    accountNumber: string
    iban: string
    swift: string
  }
  enableStripe: boolean
  stripePublicKey: string
  stripeSecretKey: string
  enablePaypal: boolean
  paypalClientId: string
  paypalClientSecret: string
}

// Shipping Zone
export interface IShippingZone {
  _id?: string
  name: string
  regions: string[] // List of regions/states
  isActive: boolean
  flatRate: number
  freeShippingMinimum: number // 0 means no free shipping
  estimatedDays: string // e.g., "3-5"
}

// Tax Configuration
export interface ITaxConfig {
  enableTax: boolean
  taxRate: number // Percentage
  taxName: string // e.g., "TVA"
  taxIncludedInPrice: boolean
  taxRegistrationNumber: string
}

// Shipping Settings
export interface IShippingSettings {
  defaultWeight: number // Default product weight in kg
  weightUnit: 'kg' | 'g' | 'lb'
  dimensionsUnit: 'cm' | 'm' | 'in'
  zones: IShippingZone[]
  tax: ITaxConfig
}

// Complete Settings Document
export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId
  siteInfo: ISiteInfo
  emailSettings: IEmailSettings
  paymentSettings: IPaymentSettings
  shippingSettings: IShippingSettings
  updatedAt: Date
  updatedBy?: string
}

const ShippingZoneSchema = new Schema<IShippingZone>({
  name: { type: String, required: true },
  regions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  flatRate: { type: Number, default: 0 },
  freeShippingMinimum: { type: Number, default: 0 },
  estimatedDays: { type: String, default: '3-5' },
}, { _id: true })

const SettingsSchema = new Schema<ISettings>(
  {
    siteInfo: {
      siteName: { type: String, default: 'Boss Vespa' },
      siteDescription: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'Tunisie' },
      socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        linkedin: { type: String, default: '' },
      },
      logo: { type: String, default: '' },
      favicon: { type: String, default: '' },
    },
    emailSettings: {
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: '' },
      smtpPassword: { type: String, default: '' },
      smtpSecure: { type: Boolean, default: false },
      fromName: { type: String, default: 'Boss Vespa' },
      fromEmail: { type: String, default: '' },
      replyToEmail: { type: String, default: '' },
      orderConfirmationEnabled: { type: Boolean, default: true },
      shippingNotificationEnabled: { type: Boolean, default: true },
      marketingEmailsEnabled: { type: Boolean, default: false },
    },
    paymentSettings: {
      currency: { type: String, default: 'TND' },
      currencySymbol: { type: String, default: 'TND' },
      enableCOD: { type: Boolean, default: true },
      enableBankTransfer: { type: Boolean, default: true },
      bankDetails: {
        bankName: { type: String, default: '' },
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        iban: { type: String, default: '' },
        swift: { type: String, default: '' },
      },
      enableStripe: { type: Boolean, default: false },
      stripePublicKey: { type: String, default: '' },
      stripeSecretKey: { type: String, default: '' },
      enablePaypal: { type: Boolean, default: false },
      paypalClientId: { type: String, default: '' },
      paypalClientSecret: { type: String, default: '' },
    },
    shippingSettings: {
      defaultWeight: { type: Number, default: 1 },
      weightUnit: { type: String, enum: ['kg', 'g', 'lb'], default: 'kg' },
      dimensionsUnit: { type: String, enum: ['cm', 'm', 'in'], default: 'cm' },
      zones: [ShippingZoneSchema],
      tax: {
        enableTax: { type: Boolean, default: true },
        taxRate: { type: Number, default: 19 },
        taxName: { type: String, default: 'TVA' },
        taxIncludedInPrice: { type: Boolean, default: true },
        taxRegistrationNumber: { type: String, default: '' },
      },
    },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
)

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

export default Settings

