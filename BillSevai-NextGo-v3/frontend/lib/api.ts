const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string>) };
  const t = token();
  if (t) h.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers: h });
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    location.href = '/login';
    throw new Error('auth');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'failed');
  return data as T;
}

export type Shop = Record<string, string | number>;
export type Service = { id: number; name: string; category: string; rate: number; active: boolean };
export type Bill = Record<string, unknown>;
