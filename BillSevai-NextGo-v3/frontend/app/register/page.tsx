'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ shop_name: '', name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const d = await api<{ token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('token', d.token);
      router.push('/billing');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Register failed');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Register Shop</h1>
        {err && <div className="err">{err}</div>}
        <form onSubmit={submit}>
          <label>Shop name</label>
          <input value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} required />
          <label>Your name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button className="btn btn-p" style={{ width: '100%', marginTop: 12 }} type="submit">Create account</button>
        </form>
        <p style={{ marginTop: 16 }}><Link href="/login">Already have account?</Link></p>
      </div>
    </div>
  );
}
