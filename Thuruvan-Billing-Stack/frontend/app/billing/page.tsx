'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api, Service, Shop } from '@/lib/api';

type CartItem = { name: string; rate: number; qty: number };

export default function BillingPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    Promise.all([
      api<Shop>('/shop'),
      api<Service[]>('/services'),
    ]).then(([s, sv]) => {
      setShop(s);
      setServices(sv.filter((x) => x.status === 'active'));
    }).finally(() => setLoading(false));
  }, [router]);

  function addSvc(s: Service) {
    setCart((prev) => {
      const ex = prev.find((x) => x.name === s.name);
      if (ex) return prev.map((x) => x.name === s.name ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { name: s.name, rate: s.rate, qty: 1 }];
    });
  }

  const sub = cart.reduce((a, i) => a + i.rate * i.qty, 0);
  const total = Math.max(0, sub - discount);
  const cur = shop?.currency || '₹';

  async function save(action: 'print' | 'wa' | 'save') {
    if (!cart.length) return alert('Add services');
    const res = await api<{ id: number }>('/bills', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: custName || 'Walk-in',
        customer_mobile: custMobile,
        pay_mode: payMode,
        discount,
        items: cart.map((c) => ({ name: c.name, rate: c.rate, qty: c.qty })),
      }),
    });
    if (action === 'save') {
      setCart([]);
      alert('Bill saved');
      return;
    }
    const q = action === 'wa' ? '?wa=1' : '';
    router.push(`/bills/${res.id}/print${q}`);
  }

  if (loading) return <p className="wrap">Loading...</p>;

  const byCat: Record<string, Service[]> = {};
  services.forEach((s) => {
    (byCat[s.category] ||= []).push(s);
  });

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ marginBottom: 16, color: '#0b3d91' }}>Billing Counter</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h2>Customer</h2>
            <label>Name</label>
            <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Walk-in" />
            <label>Mobile</label>
            <input value={custMobile} onChange={(e) => setCustMobile(e.target.value)} maxLength={10} />
            <label>Pay mode</label>
            <select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
              <option>Cash</option><option>UPI</option><option>Card</option><option>Amount pending</option>
            </select>
            <label>Discount</label>
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(+e.target.value)} />
          </div>
          <div className="card">
            <h2>Cart ({cart.length})</h2>
            <table className="tbl">
              <thead><tr><th>Item</th><th>Qty</th><th>Amt</th></tr></thead>
              <tbody>
                {cart.length === 0 ? <tr><td colSpan={3}>Empty</td></tr> : cart.map((c, i) => (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td>{c.qty}</td>
                    <td>{cur}{(c.rate * c.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', marginTop: 12 }}>Total: <strong>{cur}{total.toFixed(2)}</strong></p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => save('print')}>Save &amp; Print</button>
              <button className="btn btn-wa" onClick={() => save('wa')}>Save &amp; WhatsApp</button>
              <button className="btn" onClick={() => save('save')}>Save only</button>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>Services</h2>
            {Object.entries(byCat).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748b', margin: '10px 0 6px' }}>{cat}</div>
                <div className="svc-grid">
                  {items.map((s) => (
                    <button key={s.id} type="button" className="svc-btn" onClick={() => addSvc(s)}>
                      <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{s.name}</div>
                      <small>{cur}{s.rate}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
