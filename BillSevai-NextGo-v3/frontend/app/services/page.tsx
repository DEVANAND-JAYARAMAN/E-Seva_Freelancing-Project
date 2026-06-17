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

  const load = () => api<Service[]>('/services').then(setList);
  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    load();
  }, [router]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api('/services', { method: 'POST', body: JSON.stringify({ name, category, rate }) });
    setName(''); load();
  }

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Services</h1>
        <div className="card" style={{ maxWidth: 400 }}>
          <form onSubmit={add}>
            <label>Name</label><input value={name} onChange={e => setName(e.target.value)} required />
            <label>Category</label><input value={category} onChange={e => setCategory(e.target.value)} />
            <label>Rate</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} required />
            <button className="btn btn-p" type="submit">Add</button>
          </form>
        </div>
        <table className="tbl" style={{ marginTop: 16 }}>
          <thead><tr><th>Name</th><th>Category</th><th>Rate</th></tr></thead>
          <tbody>{list.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.category}</td><td>₹{s.rate}</td></tr>)}</tbody>
        </table>
      </main>
    </>
  );
}
