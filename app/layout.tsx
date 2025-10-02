import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { OptionalAnalytics } from '@/components/OptionalAnalytics';

export const metadata: Metadata = {
  title: 'Royal Mail Delivery Times Tracker',
  description: 'Crowdsourced Royal Mail delivery time reports with minimal fuss.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <OptionalAnalytics />
        </Suspense>
        <header className="border-b border-cat-surface1 bg-cat-mantle">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-cat-rosewater">
              Royal Mail Delivery Times
            </Link>
            <nav className="text-sm text-cat-subtext0">
              <Link href="/report" className="hover:text-cat-text">
                Report a delivery
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-cat-surface1 bg-cat-mantle">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-4 text-xs text-cat-overlay1 sm:flex-row sm:items-center sm:justify-between">
            <p>Built for fast insight. Data is crowdsourced and may be incomplete.</p>
            <nav className="flex flex-col items-start gap-2 text-cat-subtext0 sm:flex-row sm:items-center">
              <Link href="/privacy" className="hover:text-cat-text">
                Privacy Policy
              </Link>
              <div className="inline-flex items-center">
                <Script
                  id="buy-me-a-coffee"
                  strategy="lazyOnload"
                  src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
                  data-name="bmc-button"
                  data-slug="mattkneale"
                  data-color="#5F7FFF"
                  data-emoji=""
                  data-font="Poppins"
                  data-text="Supply my caffeine"
                  data-outline-color="#000000"
                  data-font-color="#ffffff"
                  data-coffee-color="#FFDD00"
                  type="text/javascript"
                />
                <noscript>
                  <a
                    href="https://www.buymeacoffee.com/mattkneale"
                    className="text-cat-sky hover:text-cat-text"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Supply my caffeine
                  </a>
                </noscript>
              </div>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
