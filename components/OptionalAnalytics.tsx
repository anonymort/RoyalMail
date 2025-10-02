'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const fallbackAnalyticsId = 'G-LZTLB12GK5';
const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || fallbackAnalyticsId;

const shouldRender = Boolean(analyticsId);

function getFullPath(pathname: string | null, search: string | undefined) {
  if (!pathname) return '/';
  return search ? `${pathname}?${search}` : pathname;
}

export function OptionalAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!shouldRender) return;
    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return;
    const search = searchParams?.toString();
    const pagePath = getFullPath(pathname, search);
    gtag('config', analyticsId, {
      page_path: pagePath,
      page_location: window.location.href
    });
  }, [pathname, searchParams]);

  if (!shouldRender) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
      <Script id="ga-setup" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
