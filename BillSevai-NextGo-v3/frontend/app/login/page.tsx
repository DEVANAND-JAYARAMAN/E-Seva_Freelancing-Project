'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@demo.test');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const d = await api<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', d.token);
      router.push('/billing');
    } catch { setErr('Invalid login'); }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ color: '#0b3d91' }}>BillSevai</h1>
        <p style={{ color: '#64748b', marginBottom: 16 }}>Next.js + Golang + AWS</p>
        {err && <div className="err">{err}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-p" style={{ width: '100%', marginTop: 12 }} type="submit">Sign in</button>
        </form>
        <p style={{ marginTop: 16, fontSize: '.88rem' }}>New shop? <Link href="/register">Register</Link></p>
      </div>
    </div>
  );
}
