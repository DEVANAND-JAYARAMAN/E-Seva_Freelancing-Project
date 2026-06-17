'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@billing.local');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const data = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      router.push('/billing');
    } catch {
      setErr('Invalid email or password');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Thuruvan Billing</h1>
        <p style={{ marginBottom: 16, color: '#64748b' }}>Next.js + Golang + AWS</p>
        {err && <div className="err">{err}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Sign in</button>
        </form>
      </div>
    </div>
  );
}
