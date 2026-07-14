import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const message = typeof err.detail === 'string' ? err.detail : (err.message || res.statusText);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { path, status: res.status, message } }));
    }
    throw new Error(`${res.status}: ${message}`);
  }
  return res.json();
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatCurrency(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(usd);
}
