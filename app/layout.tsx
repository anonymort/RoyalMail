import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { OptionalAnalytics } from '@/components/OptionalAnalytics';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <Suspense fallback={null}>
            <OptionalAnalytics />
          </Suspense>
          <header className="border-b border-cat-surface1 bg-cat-mantle">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-semibold text-cat-rosewater">
                Royal Mail Delivery Times
              </Link>
              <nav className="flex items-center gap-4 text-sm text-cat-subtext0">
                <ThemeToggle />
                <Link href="/report" className="hover:text-cat-text">
                  Report a delivery
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
          <footer className="border-t border-cat-surface1 bg-cat-mantle">
            <div className="mx-auto w-full max-w-4xl px-4 py-6 text-xs text-cat-overlay1">
              <div className="flex flex-col gap-6 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-center leading-relaxed sm:text-left">
                  Built for fast insight. Data is crowdsourced and may be incomplete.
                </p>
                <nav className="flex flex-col items-center gap-3 text-cat-subtext0 sm:flex-row sm:justify-center lg:justify-end">
                  <Link href="/privacy" className="transition hover:text-cat-text">
                    Privacy Policy
                  </Link>
                  <a
                    href="https://www.buymeacoffee.com/mattkneale"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-md bg-cat-surface1 px-3 py-2 transition hover:bg-cat-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cat-sky"
                  >
                    <Image
                      src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                      alt="Buy me a coffee"
                      width={156}
                      height={46}
                      className="h-10 w-auto"
                      priority={false}
                    />
                  </a>
                </nav>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
