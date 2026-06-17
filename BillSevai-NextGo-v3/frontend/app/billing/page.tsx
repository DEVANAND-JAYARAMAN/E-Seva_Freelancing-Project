'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api, Service, Shop } from '@/lib/api';

type CartItem = { id?: number; name: string; rate: number; qty: number };

export default function BillingPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    Promise.all([api<Shop>('/shop'), api<Service[]>('/services')]).then(([s, sv]) => {
      setShop(s);
      setServices(sv.filter(x => x.active));
    });
  }, [router]);

  const cur = String(shop?.currency || '₹');
  const sub = cart.reduce((a, i) => a + i.rate * i.qty, 0);
  const total = Math.max(0, sub - discount);

  async function save(wa: boolean) {
    if (!cart.length) return alert('Add services');
    const res = await api<{ id: number }>('/bills', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: custName || 'Walk-in', customer_mobile: custMobile,
        pay_mode: payMode, discount,
        items: cart.map(c => ({ id: c.id, name: c.name, rate: c.rate, qty: c.qty })),
      }),
    });
    router.push(`/bills/${res.id}/print${wa ? '?wa=1' : ''}`);
  }

  const byCat: Record<string, Service[]> = {};
  services.forEach(s => { (byCat[s.category] ||= []).push(s); });

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Billing</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h2>Customer</h2>
            <label>Name</label><input value={custName} onChange={e => setCustName(e.target.value)} />
            <label>Mobile</label><input value={custMobile} onChange={e => setCustMobile(e.target.value)} />
            <label>Pay mode</label>
            <select value={payMode} onChange={e => setPayMode(e.target.value)}>
              <option>Cash</option><option>UPI</option><option>Amount pending</option>
            </select>
            <label>Discount</label><input type="number" min={0} value={discount} onChange={e => setDiscount(+e.target.value)} />
          </div>
          <div className="card">
            <h2>Cart ({cart.length})</h2>
            <table className="tbl"><tbody>
              {cart.map((c, i) => <tr key={i}><td>{c.name}</td><td>{c.qty}</td><td>{cur}{(c.rate*c.qty).toFixed(2)}</td></tr>)}
            </tbody></table>
            <p style={{ textAlign: 'right', fontWeight: 800, color: '#0e7c66', marginTop: 12 }}>Total: {cur}{total.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-p" onClick={() => save(false)}>Save &amp; Print</button>
              <button className="btn btn-w" onClick={() => save(true)}>WhatsApp</button>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1/-1' }}>
            {Object.entries(byCat).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748b', margin: '8px 0' }}>{cat}</div>
                <div className="svc-grid">
                  {items.map(s => (
                    <button key={s.id} type="button" className="svc-btn" onClick={() => {
                      setCart(p => {
                        const ex = p.find(x => x.name === s.name);
                        if (ex) return p.map(x => x.name === s.name ? { ...x, qty: x.qty + 1 } : x);
                        return [...p, { id: s.id, name: s.name, rate: s.rate, qty: 1 }];
                      });
                    }}>
                      <b style={{ fontSize: '.82rem' }}>{s.name}</b><br /><small>{cur}{s.rate}</small>
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
