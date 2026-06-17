import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thuruvan Billing',
  description: 'Billing counter — Next.js + Go + AWS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
