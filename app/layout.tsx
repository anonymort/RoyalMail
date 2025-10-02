import './globals.css';
import type { Metadata } from 'next';
import { OptionalAnalytics } from '@/components/OptionalAnalytics';
import { AdsSlot } from '@/components/AdsSlot';

export const metadata: Metadata = {
  title: 'Royal Mail Delivery Times Tracker',
  description: 'Crowdsourced Royal Mail delivery time reports with minimal fuss.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <OptionalAnalytics />
        <AdsSlot />
        <header className="border-b border-cat.surface1 bg-cat.mantle">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
            <a href="/" className="text-lg font-semibold text-cat.rosewater">
              Royal Mail Delivery Times
            </a>
            <nav className="text-sm text-cat.subtext0">
              <a href="/report" className="hover:text-cat.text">
                Report a delivery
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-cat.surface1 bg-cat.mantle">
          <div className="mx-auto w-full max-w-4xl px-4 py-4 text-xs text-cat.overlay1">
            Built for fast insight. Data is crowdsourced and may be incomplete.
          </div>
        </footer>
      </body>
    </html>
  );
}
