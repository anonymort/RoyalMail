import Link from 'next/link';
import { PostcodeSearch } from '@/components/PostcodeSearch';

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-cat-rosewater">Royal Mail delivery tracker</h1>
        <p className="text-cat-subtext0">
          Crowd-sourced arrival times for Royal Mail letters and parcels. Search by postcode sector to see when
          deliveries usually land in your area.
        </p>
      </div>
      <PostcodeSearch />
      <p className="text-sm text-cat-overlay1">
        Got fresh data?{' '}
        <Link href="/report" className="text-cat-sky hover:text-cat-text">
          Report a delivery
        </Link>
        .
      </p>
    </section>
  );
}
