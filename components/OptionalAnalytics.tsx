'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
const hasAnalytics = Boolean(analyticsId);
const CONSENT_STORAGE_KEY = 'royalmail:analytics-consent';

type ConsentStatus = 'unknown' | 'accepted' | 'rejected';

function getFullPath(pathname: string | null, search: string | undefined) {
  if (!pathname) return '/';
  return search ? `${pathname}?${search}` : pathname;
}

export function OptionalAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentStatus>('unknown');
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (!hasAnalytics) {
      return;
    }

    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
      setBannerOpen(false);
      return;
    }
    setBannerOpen(true);
  }, []);

  const search = useMemo(() => searchParams?.toString(), [searchParams]);

  useEffect(() => {
    if (!hasAnalytics || consent !== 'accepted') {
      return;
    }

    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) {
      return;
    }

    const pagePath = getFullPath(pathname, search);
    gtag('config', analyticsId, {
      page_path: pagePath,
      page_location: window.location.href
    });
  }, [consent, pathname, search]);

  useEffect(() => {
    if (!hasAnalytics || consent !== 'rejected') {
      return;
    }

    const scriptSelector = `script[src*="googletagmanager.com/gtag/js?id=${analyticsId}"]`;
    document.querySelectorAll<HTMLScriptElement>(scriptSelector).forEach((script) => {
      script.parentElement?.removeChild(script);
    });
    const inlineScript = document.getElementById('ga-setup');
    inlineScript?.parentElement?.removeChild(inlineScript);

    const windowWithDataLayer = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    delete windowWithDataLayer.gtag;
    delete windowWithDataLayer.dataLayer;
  }, [consent]);

  const updateConsent = useCallback((status: Exclude<ConsentStatus, 'unknown'>) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
    setConsent(status);
    setBannerOpen(false);
  }, []);

  const reopenBanner = useCallback(() => {
    if (!hasAnalytics) return;
    setBannerOpen(true);
  }, []);

  const showScripts = hasAnalytics && consent === 'accepted';
  const showBanner = hasAnalytics && bannerOpen;

  if (!hasAnalytics) {
    return null;
  }

  return (
    <>
      {showScripts && (
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
      )}

      {consent !== 'unknown' && !bannerOpen && (
        <button
          type="button"
          onClick={reopenBanner}
          className="fixed bottom-4 right-4 z-40 rounded-md border border-cat-surface2 bg-cat-surface0 px-3 py-2 text-xs text-cat-subtext0 shadow-sm transition hover:text-cat-text"
        >
          {consent === 'accepted' ? 'Analytics enabled · Manage' : 'Enable analytics'}
        </button>
      )}

      {showBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3 rounded-lg border border-cat-surface2 bg-cat-surface0 p-4 shadow-lg">
          <div className="space-y-1 text-sm text-cat-text">
            <p className="font-semibold text-cat-rosewater">Analytics consent</p>
            <p className="text-xs text-cat-overlay1">
              We use privacy-friendly Google Analytics to understand usage. No tracking runs without your permission and
              you can change your mind anytime.
            </p>
          </div>
          {consent === 'unknown' ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => updateConsent('accepted')} className="flex-1">
                Allow analytics
              </button>
              <button
                type="button"
                onClick={() => updateConsent('rejected')}
                className="flex-1 rounded-md border border-cat-surface2 bg-cat-surface1 px-3 py-2 text-sm text-cat-text transition hover:bg-cat-surface2"
              >
                No thanks
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateConsent(consent === 'accepted' ? 'rejected' : 'accepted')}
                className="flex-1"
              >
                {consent === 'accepted' ? 'Disable analytics' : 'Enable analytics'}
              </button>
              <button
                type="button"
                onClick={() => setBannerOpen(false)}
                className="flex-1 rounded-md border border-cat-surface2 bg-cat-surface1 px-3 py-2 text-sm text-cat-text transition hover:bg-cat-surface2"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
