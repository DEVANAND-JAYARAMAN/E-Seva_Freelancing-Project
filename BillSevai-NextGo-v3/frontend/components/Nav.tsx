'use client';
import Link from 'next/link';

export default function Nav() {
  return (
    <header className="topbar">
      <strong>BillSevai</strong>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/billing">Billing</Link>
        <Link href="/bills">Bills</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/services">Services</Link>
        <Link href="/settings">Settings</Link>
        <a href="#" onClick={(e) => { e.preventDefault(); localStorage.clear(); location.href='/login'; }}>Logout</a>
      </nav>
    </header>
  );
}
