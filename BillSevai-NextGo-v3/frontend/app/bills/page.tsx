'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api } from '@/lib/api';

export default function BillsPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bills, setBills] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    api<Record<string, unknown>[]>(`/bills?date=${date}`).then(setBills);
  }, [date, router]);

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Bills</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto', marginBottom: 16 }} />
        <table className="tbl">
          <thead><tr><th>Bill</th><th>Customer</th><th>Total</th><th>Pay</th><th></th></tr></thead>
          <tbody>
            {bills.map(b => (
              <tr key={String(b.id)}>
                <td>{String(b.bill_no)}</td>
                <td>{String(b.customer_name)}</td>
                <td>₹{Number(b.total).toFixed(2)}</td>
                <td>{String(b.pay_mode)}</td>
                <td><a href={`/bills/${b.id}/print`}>Print</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
