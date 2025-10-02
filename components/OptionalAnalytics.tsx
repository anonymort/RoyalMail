'use client';

import Script from 'next/script';

const fallbackAnalyticsId = 'G-LZTLB12GK5';
const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || fallbackAnalyticsId;

const shouldRender = Boolean(analyticsId);

export function OptionalAnalytics() {
  if (!shouldRender) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
      <Script id="ga-setup" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  );
}
