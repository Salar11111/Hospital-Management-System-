import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Extracts a display name from a string id or a populated reference object. */
export function refName(ref: unknown): string {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && 'name' in (ref as Record<string, unknown>)) {
    const name = (ref as Record<string, unknown>).name;
    return typeof name === 'string' ? name : '';
  }
  return '';
}

export function formatDate(value?: string | number | Date | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value?: string | number | Date | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCurrency(value?: number | null): string {
  const n = Number(value ?? 0);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}