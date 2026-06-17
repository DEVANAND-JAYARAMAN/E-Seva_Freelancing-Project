'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api, Service } from '@/lib/api';

export default function ServicesPage() {
  const router = useRouter();
  const [list, setList] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [rate, setRate] = useState(0);

  function load() {
    api<Service[]>('/services').then(setList);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    load();
  }, [router]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/services', { method: 'POST', body: JSON.stringify({ name, category, rate }) });
    setName(''); setRate(0);
    load();
  }

  async function toggle(id: number) {
    await api(`/services/${id}/toggle`, { method: 'PATCH' });
    load();
  }

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ marginBottom: 16, color: '#0b3d91' }}>Services</h1>
        <div className="card" style={{ maxWidth: 400 }}>
          <form onSubmit={add}>
            <label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required />
            <label>Category</label><input value={category} onChange={(e) => setCategory(e.target.value)} />
            <label>Rate</label><input type="number" min={0} step={0.01} value={rate} onChange={(e) => setRate(+e.target.value)} required />
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
        </div>
        <table className="tbl" style={{ marginTop: 16 }}>
          <thead><tr><th>Name</th><th>Category</th><th>Rate</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.category}</td><td>{s.rate}</td><td>{s.status}</td>
                <td><button className="btn" onClick={() => toggle(s.id)}>Toggle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
