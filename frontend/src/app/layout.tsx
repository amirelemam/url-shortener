import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'URL Shortener',
  description: 'A simple and efficient URL shortener service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-blue-950 dark:bg-blue-950">
      <body className={`${inter.className} bg-blue-950`}>
        <div className="flex flex-col min-h-screen">
          <div className="fixed top-0 left-0 w-full z-10">
            <Header />
          </div>

          <main className="flex-1 pt-16">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
