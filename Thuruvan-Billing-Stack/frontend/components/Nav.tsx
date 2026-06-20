'use client';

import Link from 'next/link';

export default function Nav() {
  return (
    <header className="topbar">
      <strong>Thuruvan Billing</strong>
      <nav>
        <Link href="/billing">Billing</Link>
        <Link href="/history">History</Link>
        <Link href="/services">Services</Link>
        <Link href="/settings">Settings</Link>
        <a href="#" onClick={(e) => { e.preventDefault(); localStorage.removeItem('token'); location.href = '/login'; }}>Logout</a>
      </nav>
    </header>
  );
}
