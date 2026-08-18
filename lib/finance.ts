/**
 * Finance calculations for vehicle loans.
 * Uses amortizing loan formula: M = P * r(1+r)^n / ((1+r)^n - 1)
 * where P = principal (balance), r = monthly rate, n = months.
 */

export function calculateMonthlyPayment(
  balance: number,
  annualInterestRate: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const r = annualInterestRate / 100 / 12;
  if (r === 0) return balance / months;
  const factor = Math.pow(1 + r, months);
  return (balance * r * factor) / (factor - 1);
}

export function calculateBalance(vehiclePrice: number, deposit: number): number {
  return Math.max(0, vehiclePrice - deposit);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Formats as "KSH 1,600,000.00" to match the printed sale agreement. */
export function formatKsh(amount: number): string {
  return `KSH ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formats a date string as "15.08.2026" to match the printed sale agreement. */
export function formatDateDMY(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const ONES = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
  'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function threeDigitsToWords(n: number): string {
  let out = '';
  if (n >= 100) {
    out += `${ONES[Math.floor(n / 100)]} HUNDRED`;
    n %= 100;
    if (n > 0) out += ' ';
  }
  if (n >= 20) {
    out += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) out += `-${ONES[n % 10]}`;
  } else if (n > 0) {
    out += ONES[n];
  }
  return out;
}

/** Converts a whole-shilling amount to words, e.g. 1600000 -> "ONE MILLION SIX HUNDRED THOUSAND". */
export function numberToWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return 'ZERO';
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const rest = n % 1_000;

  const parts: string[] = [];
  if (billions) parts.push(`${threeDigitsToWords(billions)} BILLION`);
  if (millions) parts.push(`${threeDigitsToWords(millions)} MILLION`);
  if (thousands) parts.push(`${threeDigitsToWords(thousands)} THOUSAND`);
  if (rest) parts.push(threeDigitsToWords(rest));

  return parts.join(' ');
}

/** "ONE MILLION SIX HUNDRED THOUSAND ONLY" style amount-in-words for the purchase price line. */
export function amountInWords(amount: number): string {
  return `${numberToWords(amount)} ONLY`;
}
