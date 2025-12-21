import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const fromEmail = process.env.FROM_EMAIL || 'noreply@boss-vespa.tn'

interface OrderEmailData {
  orderId: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCost: number
  total: number
  status: string
  paymentMethod: string
  deliveryRequested: boolean
  deliveryAddress?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  notes?: string
}

export async function sendOrderConfirmationEmail(order: OrderEmailData, userEmail: string, userName?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Confirmation de commande ${order.orderId} - Boss Vespa`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f59e0b; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Merci pour votre commande !</h1>
                <p>Votre commande a été enregistrée avec succès</p>
              </div>
              <div class="content">
                <p>Bonjour ${userName || 'Cher client'},</p>
                <p>Nous avons bien reçu votre commande <strong>${order.orderId}</strong>.</p>
                
                <div class="order-details">
                  <h2>Détails de la commande</h2>
                  ${order.items
                    .map(
                      (item) => `
                    <div class="item">
                      <strong>${item.name}</strong> - Quantité: ${item.quantity} - Prix: ${item.price} TND
                    </div>
                  `
                    )
                    .join('')}
                  <div class="total">
                    <p>Sous-total: ${order.subtotal} TND</p>
                    <p>Frais de livraison: ${order.shippingCost} TND</p>
                    <p>Total: ${order.total} TND</p>
                  </div>
                </div>

                <p><strong>Statut:</strong> ${order.status}</p>
                <p><strong>Mode de paiement:</strong> ${order.paymentMethod}</p>
                
                ${order.deliveryRequested ? `<p><strong>Adresse de livraison:</strong><br>
                  ${order.deliveryAddress?.street || ''}<br>
                  ${order.deliveryAddress?.city || ''} ${order.deliveryAddress?.postalCode || ''}<br>
                  ${order.deliveryAddress?.country || ''}
                </p>` : ''}

                <p>Notre équipe vous contactera sous <strong>24h</strong> pour confirmer les détails de livraison et le paiement.</p>
                
                <p>Pour toute question, n'hésitez pas à nous contacter au <strong>+216 97 310 394</strong> ou par email à <strong>contact@boss-vespa.tn</strong>.</p>
              </div>
              <div class="footer">
                <p>Boss Vespa Mahdia - Votre partenaire de confiance pour les Vespas en Tunisie</p>
                <p>Avenue principale, Mahdia, Tunisie</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendAdminOrderNotification(order: OrderEmailData, userEmail: string, userName?: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@boss-vespa.tn'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nouvelle commande ${order.orderId} - Boss Vespa`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nouvelle commande reçue</h1>
                <p>Commande ${order.orderId}</p>
              </div>
              <div class="content">
                <h2>Informations client</h2>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Nom:</strong> ${userName || 'Non spécifié'}</p>
                
                <div class="order-details">
                  <h2>Détails de la commande</h2>
                  ${order.items
                    .map(
                      (item) => `
                    <div class="item">
                      <strong>${item.name}</strong> - Quantité: ${item.quantity} - Prix: ${item.price} TND
                    </div>
                  `
                    )
                    .join('')}
                  <div class="total">
                    <p>Sous-total: ${order.subtotal} TND</p>
                    <p>Frais de livraison: ${order.shippingCost} TND</p>
                    <p>Total: ${order.total} TND</p>
                  </div>
                </div>

                <p><strong>Statut:</strong> ${order.status}</p>
                <p><strong>Mode de paiement:</strong> ${order.paymentMethod}</p>
                
                ${order.deliveryRequested ? `<p><strong>Adresse de livraison:</strong><br>
                  ${order.deliveryAddress?.street || ''}<br>
                  ${order.deliveryAddress?.city || ''} ${order.deliveryAddress?.postalCode || ''}<br>
                  ${order.deliveryAddress?.country || ''}
                </p>` : ''}

                ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending admin notification:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending admin order notification:', error)
    return { success: false, error }
  }
}

