'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, Bill, Shop } from '@/lib/api';

export default function PrintBillPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const wa = search.get('wa') === '1';
  const [bill, setBill] = useState<Bill | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    Promise.all([
      api<Bill>(`/bills/${id}`),
      api<Shop>('/shop'),
    ]).then(([b, s]) => {
      setBill(b);
      setShop(s);
      if (wa && b.customer_mobile) {
        const text = `${s.name} — Bill ${b.bill_no} Total: ${s.currency}${b.total}`;
        const mob = b.customer_mobile.replace(/\D/g, '');
        window.open(`https://wa.me/91${mob}?text=${encodeURIComponent(text)}`, '_blank');
      }
    });
  }, [id, wa]);

  if (!bill || !shop) return <p style={{ padding: 24 }}>Loading...</p>;

  const cur = shop.currency;
  const waText = `${shop.name} — Bill ${bill.bill_no} Total: ${cur}${bill.total}`;
  const mob = bill.customer_mobile?.replace(/\D/g, '') || '';

  return (
    <>
      <div className="no-print" style={{ textAlign: 'center', padding: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
        {mob && (
          <a className="btn btn-wa" href={`https://wa.me/91${mob}?text=${encodeURIComponent(waText)}`} target="_blank">WhatsApp</a>
        )}
        <a className="btn" href="/billing">New Bill</a>
      </div>
      <div style={{ maxWidth: '80mm', margin: '0 auto', background: '#fff', padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{shop.name}</div>
          {shop.tagline && <div>{shop.tagline}</div>}
          {(shop.address || shop.phone) && <div style={{ fontSize: 11 }}>{shop.address} {shop.phone && `· ${shop.phone}`}</div>}
        </div>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bill <b>{bill.bill_no}</b></span><span>{new Date(bill.created_at).toLocaleString()}</span></div>
        {bill.customer_name !== 'Walk-in' && <div>Customer: <b>{bill.customer_name}</b></div>}
        <hr />
        <table style={{ width: '100%', fontSize: 11 }}>
          <thead><tr><th>Item</th><th>Qty</th><th>Amt</th></tr></thead>
          <tbody>
            {bill.items?.map((it, i) => (
              <tr key={i}><td>{it.service_name}</td><td>{it.qty}</td><td>{cur}{it.amount.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{cur}{bill.subtotal.toFixed(2)}</span></div>
        {bill.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>-{cur}{bill.discount.toFixed(2)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 14 }}><span>TOTAL</span><span>{cur}{bill.total.toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pay</span><span>{bill.pay_mode}</span></div>
        {shop.upi_id && <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11 }}>UPI: {shop.upi_id}</div>}
        {shop.footer_note && <div style={{ textAlign: 'center', marginTop: 8 }}>{shop.footer_note}</div>}
      </div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </>
  );
}
