// Supported currencies with metadata
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar',          symbol: '$',  locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro',               symbol: '€',  locale: 'de-DE', decimals: 2 },
  { code: 'GBP', name: 'British Pound',      symbol: '£',  locale: 'en-GB', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'C$', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$', locale: 'en-AU', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',  locale: 'ja-JP', decimals: 0 },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr', locale: 'de-CH', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',  locale: 'zh-CN', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹',  locale: 'en-IN', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$',locale: 'es-MX', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'KRW', name: 'South Korean Won',   symbol: '₩',  locale: 'ko-KR', decimals: 0 },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$', locale: 'en-SG', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$',locale: 'zh-HK', decimals: 2 },
  { code: 'NOK', name: 'Norwegian Krone',    symbol: 'kr', locale: 'nb-NO', decimals: 2 },
  { code: 'SEK', name: 'Swedish Krona',      symbol: 'kr', locale: 'sv-SE', decimals: 2 },
  { code: 'DKK', name: 'Danish Krone',       symbol: 'kr', locale: 'da-DK', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$',locale: 'en-NZ', decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R',  locale: 'en-ZA', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ',locale: 'ar-AE', decimals: 2 },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
}

export function formatCurrencyAmount(amount: number, code: string): string {
  const info = getCurrencyInfo(code);
  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals,
    }).format(amount);
  } catch {
    return `${info.symbol}${amount.toFixed(info.decimals)}`;
  }
}

// Static exchange rates from USD (updated periodically in production via API)
const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.5,
  CHF: 0.89,
  CNY: 7.24,
  INR: 83.1,
  MXN: 17.15,
  BRL: 4.97,
  KRW: 1325,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.55,
  SEK: 10.42,
  DKK: 6.88,
  NZD: 1.63,
  ZAR: 18.63,
  AED: 3.67,
};

export function convertFromUSD(usdAmount: number, targetCurrency: string): number {
  const rate = USD_RATES[targetCurrency] ?? 1;
  return usdAmount * rate;
}

export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = USD_RATES[fromCurrency] ?? 1;
  return amount / rate;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const usd = convertToUSD(amount, fromCurrency);
  return convertFromUSD(usd, toCurrency);
}

export function getExchangeRateLabel(fromCurrency: string, toCurrency: string): string {
  if (fromCurrency === toCurrency) return '';
  const rate = convertCurrency(1, fromCurrency, toCurrency);
  return `1 ${fromCurrency} ≈ ${rate.toFixed(4)} ${toCurrency}`;
}
