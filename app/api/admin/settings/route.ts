import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Settings from '@/models/Settings'

// Default settings template
const defaultSettings = {
  siteInfo: {
    siteName: 'Boss Vespa',
    siteDescription: 'Votre concessionnaire Vespa de confiance en Tunisie',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Tunisie',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      linkedin: '',
    },
    logo: '',
    favicon: '',
  },
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromName: 'Boss Vespa',
    fromEmail: '',
    replyToEmail: '',
    orderConfirmationEnabled: true,
    shippingNotificationEnabled: true,
    marketingEmailsEnabled: false,
  },
  paymentSettings: {
    currency: 'TND',
    currencySymbol: 'TND',
    enableCOD: true,
    enableBankTransfer: true,
    bankDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      iban: '',
      swift: '',
    },
    enableStripe: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    enablePaypal: false,
    paypalClientId: '',
    paypalClientSecret: '',
  },
  shippingSettings: {
    defaultWeight: 1,
    weightUnit: 'kg' as const,
    dimensionsUnit: 'cm' as const,
    zones: [
      {
        name: 'Grand Tunis',
        regions: ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'],
        isActive: true,
        flatRate: 7,
        freeShippingMinimum: 500,
        estimatedDays: '1-2',
      },
      {
        name: 'Nord',
        regions: ['Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Nabeul', 'Zaghouan'],
        isActive: true,
        flatRate: 12,
        freeShippingMinimum: 500,
        estimatedDays: '2-3',
      },
      {
        name: 'Centre',
        regions: ['Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid'],
        isActive: true,
        flatRate: 15,
        freeShippingMinimum: 500,
        estimatedDays: '2-4',
      },
      {
        name: 'Sud',
        regions: ['Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'],
        isActive: true,
        flatRate: 20,
        freeShippingMinimum: 500,
        estimatedDays: '3-5',
      },
    ],
    tax: {
      enableTax: true,
      taxRate: 19,
      taxName: 'TVA',
      taxIncludedInPrice: true,
      taxRegistrationNumber: '',
    },
  },
}

// GET - Retrieve settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await connectDB()
    
    // Get the single settings document or create one with defaults
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = await Settings.create(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()
    
    // Get existing settings or create new
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings(defaultSettings)
    }

    // Update only the provided sections
    if (body.siteInfo) {
      settings.siteInfo = { ...settings.siteInfo, ...body.siteInfo }
    }
    if (body.emailSettings) {
      settings.emailSettings = { ...settings.emailSettings, ...body.emailSettings }
    }
    if (body.paymentSettings) {
      settings.paymentSettings = { ...settings.paymentSettings, ...body.paymentSettings }
    }
    if (body.shippingSettings) {
      settings.shippingSettings = { ...settings.shippingSettings, ...body.shippingSettings }
    }

    settings.updatedBy = session.user?.email || 'admin'

    await settings.save()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}

// PATCH - Update specific section
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { section, data } = body

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section et données requises' },
        { status: 400 }
      )
    }

    const validSections = ['siteInfo', 'emailSettings', 'paymentSettings', 'shippingSettings']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Section invalide' },
        { status: 400 }
      )
    }

    await connectDB()
    
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings(defaultSettings)
    }

    // Update the specific section
    (settings as unknown as Record<string, unknown>)[section] = {
      ...(settings as unknown as Record<string, unknown>)[section] as object,
      ...data
    }
    
    settings.updatedBy = session.user?.email || 'admin'

    await settings.save()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error patching settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}

