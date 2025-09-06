import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string, decimals: number = 2): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(number);
}

export function formatPercentage(value: number | string, decimals: number = 2): string {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return `${formatNumber(number, decimals)}%`;
}

export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidAddress(address: string): boolean {
  // Basic Aptos address validation
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

export function isValidTokenSymbol(symbol: string): boolean {
  return /^[A-Z0-9]{1,10}$/.test(symbol);
}

export function parseTokenAmount(amount: string, decimals: number): string {
  const num = parseFloat(amount);
  return (num * Math.pow(10, decimals)).toString();
}

export function formatTokenAmount(amount: string, decimals: number): string {
  const num = parseFloat(amount);
  return (num / Math.pow(10, decimals)).toFixed(6);
}
