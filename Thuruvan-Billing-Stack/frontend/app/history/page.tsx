'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api, Bill, Shop } from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bills, setBills] = useState<Bill[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    api<Shop>('/shop').then(setShop);
  }, [router]);

  useEffect(() => {
    api<Bill[]>(`/bills?date=${date}`).then(setBills);
  }, [date]);

  const cur = shop?.currency || '₹';
  const dayTotal = bills.reduce((a, b) => a + b.total, 0);

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ marginBottom: 16, color: '#0b3d91' }}>Bill History</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 'auto', marginBottom: 16 }} />
        <table className="tbl">
          <thead><tr><th>Bill</th><th>Customer</th><th>Total</th><th>Pay</th><th></th></tr></thead>
          <tbody>
            {bills.length === 0 ? <tr><td colSpan={5}>No bills</td></tr> : bills.map((b) => (
              <tr key={b.id}>
                <td>{b.bill_no}</td>
                <td>{b.customer_name}</td>
                <td>{cur}{b.total.toFixed(2)}</td>
                <td>{b.pay_mode}</td>
                <td><a href={`/bills/${b.id}/print`}>Print</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length > 0 && <p style={{ marginTop: 12 }}>Day total: <strong>{cur}{dayTotal.toFixed(2)}</strong></p>}
      </main>
    </>
  );
}
