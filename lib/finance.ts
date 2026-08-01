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
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}
