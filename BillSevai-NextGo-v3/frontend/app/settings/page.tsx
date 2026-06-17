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
    await api('/shop', { method: 'PUT', body: JSON.stringify(shop) });
    setMsg('Saved!');
  }

  if (!shop) return <p className="wrap">Loading...</p>;

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Settings</h1>
        {msg && <div style={{ background: '#dcfce7', padding: 10, borderRadius: 8, marginBottom: 12 }}>{msg}</div>}
        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={save}>
            {['name','tagline','address','phone','gstin','upi_id','bill_prefix','footer_note','brand_color'].map(k => (
              <div key={k}>
                <label>{k}</label>
                <input value={String(shop[k] || '')} onChange={e => setShop({ ...shop, [k]: e.target.value })} />
              </div>
            ))}
            <button className="btn btn-p" type="submit">Save</button>
          </form>
        </div>
      </main>
    </>
  );
}
