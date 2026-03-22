// Multi-currency support for InvoiceAI
// Supports 15 currencies with formatting, exchange rates, and tax presets per region

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', decimals: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'zh-HK', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', locale: 'es-MX', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', decimals: 2 },
];

export function getCurrencyInfo(code: string): CurrencyInfo {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) ?? SUPPORTED_CURRENCIES[0];
}

export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const info = getCurrencyInfo(currencyCode);
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(amount);
}

// Tax presets by region
export interface TaxPreset {
  id: string;
  label: string;
  rate: number;
  description: string;
  region: string;
}

export const TAX_PRESETS: TaxPreset[] = [
  { id: 'none', label: 'No Tax', rate: 0, description: 'No tax applied', region: 'Global' },
  { id: 'vat-uk', label: 'UK VAT (20%)', rate: 20, description: 'UK Value Added Tax', region: 'GB' },
  { id: 'vat-eu-standard', label: 'EU VAT Standard (21%)', rate: 21, description: 'EU standard VAT rate', region: 'EU' },
  { id: 'vat-eu-reduced', label: 'EU VAT Reduced (10%)', rate: 10, description: 'EU reduced VAT rate for essential goods', region: 'EU' },
  { id: 'gst-au', label: 'AU GST (10%)', rate: 10, description: 'Australian Goods & Services Tax', region: 'AU' },
  { id: 'gst-nz', label: 'NZ GST (15%)', rate: 15, description: 'New Zealand GST', region: 'NZ' },
  { id: 'gst-in', label: 'India GST (18%)', rate: 18, description: 'Indian Goods & Services Tax', region: 'IN' },
  { id: 'gst-ca', label: 'Canada GST/HST (13%)', rate: 13, description: 'Canadian Goods & Services Tax / Harmonized Sales Tax', region: 'CA' },
  { id: 'us-sales-tax', label: 'US Sales Tax (8%)', rate: 8, description: 'Typical US state sales tax', region: 'US' },
  { id: 'custom', label: 'Custom Rate', rate: -1, description: 'Enter a custom tax rate', region: 'Global' },
];

// Exchange rate cache (in-memory, populated from /api/currency/rates)
const rateCache: { rates: Record<string, number>; updatedAt: number } = {
  rates: { USD: 1 },
  updatedAt: 0,
};

export async function getExchangeRates(baseCurrency = 'USD'): Promise<Record<string, number>> {
  const now = Date.now();
  const stale = now - rateCache.updatedAt > 24 * 60 * 60 * 1000; // 24h

  if (stale) {
    try {
      const res = await fetch(`/api/currency/rates?base=${baseCurrency}`, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        rateCache.rates = data.rates;
        rateCache.updatedAt = now;
      }
    } catch {
      // Use stale rates if fetch fails
    }
  }

  return rateCache.rates;
}

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency] ?? 1;
  const toRate = rates[toCurrency] ?? 1;
  return (amount / fromRate) * toRate;
}
