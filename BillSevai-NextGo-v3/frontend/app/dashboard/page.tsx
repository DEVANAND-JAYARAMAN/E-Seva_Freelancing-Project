'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ today_bills: 0, today_total: 0 });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    api<{ today_bills: number; today_total: number }>('/dashboard').then(setStats);
  }, [router]);

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 style={{ color: '#0b3d91', marginBottom: 16 }}>Dashboard</h1>
        <div className="kpi">
          <div className="box"><div className="num">{stats.today_bills}</div><div>Today bills</div></div>
          <div className="box"><div className="num">₹{stats.today_total.toFixed(0)}</div><div>Today collection</div></div>
        </div>
        <a className="btn btn-p" href="/billing">Open Billing Counter →</a>
      </main>
    </>
  );
}
