'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api } from '@/lib/api';

export default function CustomersPage() {
  const router = useRouter();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const load = () => api<Record<string, unknown>[]>('/customers').then(setList);
  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    load();
  }, [router]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/customers', { method: 'POST', body: JSON.stringify({ name, mobile }) });
    setName(''); setMobile(''); load();
  }

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Customers</h1>
        <div className="card" style={{ maxWidth: 400 }}>
          <form onSubmit={add}>
            <label>Name</label><input value={name} onChange={e => setName(e.target.value)} required />
            <label>Mobile</label><input value={mobile} onChange={e => setMobile(e.target.value)} />
            <button className="btn btn-p" type="submit">Add</button>
          </form>
        </div>
        <table className="tbl" style={{ marginTop: 16 }}>
          <thead><tr><th>Name</th><th>Mobile</th></tr></thead>
          <tbody>{list.map(c => <tr key={String(c.id)}><td>{String(c.name)}</td><td>{String(c.mobile || '')}</td></tr>)}</tbody>
        </table>
      </main>
    </>
  );
}
