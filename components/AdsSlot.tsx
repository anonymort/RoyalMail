'use client';

import { useEffect, useState } from 'react';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export function AdsSlot() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const pushAd = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.debug('Adsense push skipped', error);
      }
    };

    const scriptId = 'adsbygoogle-js';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      setEnabled(true);
      pushAd();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      setEnabled(true);
      pushAd();
    };
    script.onerror = () => setEnabled(false);
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  if (!clientId || !enabled) return null;

  return (
    <aside className="fixed bottom-4 right-4 hidden w-[300px] max-w-full rounded-xl border border-cat.surface2 bg-cat.surface0 p-2 shadow-lg lg:block">
      <ins
        className="adsbygoogle block h-[250px] w-full"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-full-width-responsive="false"
        data-ad-format="rectangle"
      />
    </aside>
  );
}
