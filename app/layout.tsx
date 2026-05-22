import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thuruvan Dashboard",
  description: "Modern dashboard for payment and service operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
