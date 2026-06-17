'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api, Shop } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    api<Shop>('/shop').then(setShop);
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!shop) return;
    await api('/shop', { method: 'PUT', body: JSON.stringify(shop) });
    setMsg('Saved!');
  }

  if (!shop) return <p className="wrap">Loading...</p>;

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ marginBottom: 16, color: '#0b3d91' }}>Settings</h1>
        {msg && <div style={{ background: '#dcfce7', padding: 10, borderRadius: 8, marginBottom: 12 }}>{msg}</div>}
        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={save}>
            <label>Shop name</label>
            <input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} required />
            <label>Tagline</label>
            <input value={shop.tagline || ''} onChange={(e) => setShop({ ...shop, tagline: e.target.value })} />
            <label>Address</label>
            <textarea value={shop.address || ''} onChange={(e) => setShop({ ...shop, address: e.target.value })} rows={2} />
            <label>Phone</label>
            <input value={shop.phone || ''} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
            <label>UPI ID</label>
            <input value={shop.upi_id || ''} onChange={(e) => setShop({ ...shop, upi_id: e.target.value })} />
            <label>Bill prefix</label>
            <input value={shop.bill_prefix} onChange={(e) => setShop({ ...shop, bill_prefix: e.target.value })} />
            <label>Footer</label>
            <input value={shop.footer_note || ''} onChange={(e) => setShop({ ...shop, footer_note: e.target.value })} />
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        </div>
      </main>
    </>
  );
}
