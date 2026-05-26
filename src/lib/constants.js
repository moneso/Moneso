export const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { id: 'sepa', label: 'SEPA Transfer', icon: '🇪🇺' },
  { id: 'revolut', label: 'Revolut', icon: '💜' },
  { id: 'paypal', label: 'PayPal', icon: '🔵' },
  { id: 'wise', label: 'Wise', icon: '🟢' },
  { id: 'cash', label: 'Cash in Person', icon: '💵' },
  { id: 'twint', label: 'Twint', icon: '🇨🇭' },
  { id: 'bizum', label: 'Bizum', icon: '🇪🇸' },
  { id: 'other', label: 'Other', icon: '💳' },
]

export const CURRENCIES = [
  { id: 'EUR', label: 'EUR — Euro', symbol: '€' },
  { id: 'USD', label: 'USD — US Dollar', symbol: '$' },
  { id: 'GBP', label: 'GBP — British Pound', symbol: '£' },
  { id: 'CHF', label: 'CHF — Swiss Franc', symbol: 'Fr' },
  { id: 'SEK', label: 'SEK — Swedish Krona', symbol: 'kr' },
  { id: 'NOK', label: 'NOK — Norwegian Krone', symbol: 'kr' },
]

export const COUNTRIES = [
  { id: 'DE', label: '🇩🇪 Germany' },
  { id: 'ES', label: '🇪🇸 Spain' },
  { id: 'FR', label: '🇫🇷 France' },
  { id: 'IT', label: '🇮🇹 Italy' },
  { id: 'NL', label: '🇳🇱 Netherlands' },
  { id: 'CH', label: '🇨🇭 Switzerland' },
  { id: 'AT', label: '🇦🇹 Austria' },
  { id: 'GB', label: '🇬🇧 United Kingdom' },
  { id: 'US', label: '🇺🇸 United States' },
  { id: 'GLOBAL', label: '🌍 Global' },
]

export const TRADE_STATUS = {
  pending: { label: 'Pending', color: 'text-yellow-400' },
  funded: { label: 'Funded', color: 'text-blue-400' },
  paid: { label: 'Payment Sent', color: 'text-orange-400' },
  completed: { label: 'Completed', color: 'text-green-400' },
  disputed: { label: 'Disputed', color: 'text-red-400' },
  cancelled: { label: 'Cancelled', color: 'text-zinc-500' },
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find(p => p.id === id) || { label: id, icon: '💳' }
}

export function getCurrency(id) {
  return CURRENCIES.find(c => c.id === id) || { symbol: id }
}

export function formatReputation(profile) {
  const total = profile.positive_feedback + profile.negative_feedback
  if (total === 0) return { score: 100, total: 0 }
  return {
    score: Math.round((profile.positive_feedback / total) * 100),
    total,
  }
}
