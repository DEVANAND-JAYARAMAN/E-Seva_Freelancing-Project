'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const [bill, setBill] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api<Record<string, unknown>>(`/bills/${id}`).then(b => {
      setBill(b);
      if (search.get('wa') === '1' && b.customer_mobile) {
        const shop = b.shop as Record<string, string>;
        const text = `${shop.name} Bill ${b.bill_no} Total: ${shop.currency}${b.total}`;
        const mob = String(b.customer_mobile).replace(/\D/g, '');
        window.open(`https://wa.me/91${mob}?text=${encodeURIComponent(text)}`, '_blank');
      }
    });
  }, [id, search]);

  if (!bill) return <p style={{ padding: 24 }}>Loading...</p>;
  const shop = bill.shop as Record<string, string>;
  const items = bill.items as { service_name: string; qty: number; amount: number }[];
  const cur = shop.currency || '₹';

  return (
    <>
      <div style={{ textAlign: 'center', padding: 12 }} className="no-print">
        <button className="btn btn-p" onClick={() => window.print()}>Print</button>
        <a className="btn btn-p" href="/billing" style={{ marginLeft: 8 }}>New Bill</a>
      </div>
      <div style={{ maxWidth: 300, margin: '0 auto', background: '#fff', padding: 16, fontFamily: 'monospace', fontSize: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{shop.name}</div>
          {shop.tagline && <div>{shop.tagline}</div>}
          {shop.phone && <div>{shop.phone}</div>}
        </div>
        <hr />
        <div>Bill <b>{String(bill.bill_no)}</b></div>
        <div>Customer: {String(bill.customer_name)}</div>
        <hr />
        <table style={{ width: '100%' }}>
          {items?.map((it, i) => (
            <tr key={i}><td>{it.service_name}</td><td>{it.qty}</td><td align="right">{cur}{it.amount}</td></tr>
          ))}
        </table>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>TOTAL</span><span>{cur}{Number(bill.total).toFixed(2)}</span>
        </div>
        <div>Pay: {String(bill.pay_mode)}</div>
        {shop.upi_id && <div style={{ textAlign: 'center', marginTop: 8 }}>UPI: {shop.upi_id}</div>}
        {shop.footer_note && <div style={{ textAlign: 'center', marginTop: 8 }}>{shop.footer_note}</div>}
      </div>
      <style>{`@media print{.no-print{display:none}}`}</style>
    </>
  );
}
