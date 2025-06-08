import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers'; // Import Providers wrapper
import Navbar from '../components/Navbar'; // Import Navbar (ตรวจสอบ path)

export const metadata: Metadata = {
  title: 'Room Booking App',
  description: 'A minimal room booking application built with Next.js and Rust backend.',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* Providers wrapper */}
          {/*<Navbar />*/} {/* Navbar should be inside Providers */}
          <main>{children}</main> {/* children คือเนื้อหาของแต่ละหน้า (page.js/tsx) */}
        </Providers>
      </body>
    </html>
  );
}