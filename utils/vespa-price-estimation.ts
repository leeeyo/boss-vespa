// Vespa model prices estimation (in TND)
// These are base prices for each model type

export const VESPA_MODEL_PRICES: Record<string, number> = {
  'GTS': 18000,
  'GTV': 20000,
  'Primavera': 12500,
  'Sprint': 14000,
  'Snake': 16000,
}

// Get the base price for a Vespa model
export function getVespaModelPrice(model: string): number {
  // Try exact match first
  if (VESPA_MODEL_PRICES[model]) {
    return VESPA_MODEL_PRICES[model]
  }
  
  // Try case-insensitive match
  const normalizedModel = model.toLowerCase()
  for (const [key, value] of Object.entries(VESPA_MODEL_PRICES)) {
    if (key.toLowerCase() === normalizedModel) {
      return value
    }
  }
  
  // Default price if model not found
  return 25000
}

// Format price for display
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-TN') + ' TND'
}

// Calculate total estimated price
export function calculateEstimatedPrice(
  modelPrice: number,
  accessoriesTotal: number,
  deliveryFee: number = 0
): number {
  return modelPrice + accessoriesTotal + deliveryFee
}

