import Link from 'next/link';
import { Suspense } from 'react';
import { ContributionSnapshot } from '@/components/ContributionSnapshot';
import { ReportForm } from '@/components/ReportForm';

export default function ReportPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-cat-rosewater">Report a delivery</h1>
        <p className="text-sm text-cat-overlay1">
          Help your neighbours by sharing when Royal Mail reached you today. We only need your postcode – no personal
          details.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Suspense fallback={<p className="text-sm text-cat-overlay1">Loading form…</p>}>
          <ReportForm />
        </Suspense>
        <ContributionSnapshot />
      </div>
      <p className="text-xs text-cat-overlay1">
        Looking for stats?
        <Link href="/" className="ml-1 text-cat-sky">
          Jump back to search.
        </Link>
      </p>
    </section>
  );
}
