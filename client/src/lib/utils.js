import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function refName(ref) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && 'name' in ref) {
    const name = ref.name;
    return typeof name === 'string' ? name : '';
  }
  return '';
}
function formatDate(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatDateTime(value) {
  if (!value) return '\u2014';
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
function formatCurrency(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
export { cn, formatCurrency, formatDate, formatDateTime, refName };
