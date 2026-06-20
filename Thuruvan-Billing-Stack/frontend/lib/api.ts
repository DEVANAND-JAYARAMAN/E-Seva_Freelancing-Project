const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'request failed');
  return data as T;
}

export type Shop = {
  id: number;
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  upi_id?: string;
  bill_prefix: string;
  currency: string;
  footer_note?: string;
};

export type Service = {
  id: number;
  name: string;
  category: string;
  rate: number;
  status: string;
};

export type BillItem = {
  service_name: string;
  rate: number;
  qty: number;
  amount: number;
};

export type Bill = {
  id: number;
  bill_no: string;
  customer_name: string;
  customer_mobile?: string;
  subtotal: number;
  discount: number;
  total: number;
  pay_mode: string;
  created_at: string;
  items?: BillItem[];
};
