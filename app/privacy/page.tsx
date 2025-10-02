import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – Royal Mail Delivery Times',
  description:
    'Learn how the Royal Mail Delivery Times project collects, stores, and protects delivery report data in line with GDPR expectations.'
};

const LAST_UPDATED = '2 October 2025';

export default function PrivacyPolicyPage() {
  return (
    <section className="space-y-6 text-sm leading-6 text-cat-overlay0">
      <header className="space-y-2 text-cat-text">
        <h1 className="text-3xl font-semibold text-cat-rosewater">Privacy Policy</h1>
        <p className="text-cat-overlay1">Last updated: {LAST_UPDATED}</p>
        <p>
          This policy explains how the Royal Mail Delivery Times project (&ldquo;we&rdquo;, &ldquo;us&rdquo;) processes the
          limited information submitted by visitors. The project is community maintained and does not operate as a
          commercial entity. We comply with the principles of the UK GDPR and EU GDPR.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Data we collect</h2>
        <p>We only collect the minimum information required to generate postcode-level delivery statistics:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Delivery report submissions containing postcode, delivery date, delivery time window, delivery type, and an
            optional free-text note. Postcodes are normalised to sector level. No names, account identifiers, or precise
            addresses are stored.
          </li>
          <li>
            Aggregated telemetry from Google Analytics (GA4) limited to anonymised usage metrics (page views, device
            type, approximate region). IP anonymisation is enforced by Google, and we do not collect advertising
            identifiers.
          </li>
        </ul>
        <p>We do not intentionally collect special category data. Please avoid including personal details within notes.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">How data is stored</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Production data is hosted on a managed PostgreSQL instance operated by Railway (Railway Infrastructure, Inc.)
            within the EU West region. Raw submissions are kept for audit and statistical accuracy.
          </li>
          <li>
            Development environments may use local SQLite databases which remain on the contributor&rsquo;s machine.
          </li>
          <li>Google Analytics is provided by Google LLC and stores cookies consistent with their privacy policy.</li>
        </ul>
        <p>Infrastructure access is limited to project maintainers via authenticated Railway accounts.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Purpose and legal basis</h2>
        <p>
          We process delivery reports to generate aggregated statistics that help communities understand typical postal
          delivery timings. The legal basis is legitimate interests (Article 6(1)(f) UK/EU GDPR) because the processing is
          minimal, non-commercial, and benefits contributors who opt in by submitting data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Retention</h2>
        <p>
          Raw reports are retained for a maximum of 24 months to support trend validation. Aggregated metrics may be
          stored longer as they no longer relate to identifiable individuals. You may request deletion earlier by
          referencing the details of your submission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Sharing and third parties</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Railway Infrastructure, Inc. (hosting and managed Postgres).</li>
          <li>Google LLC (Google Analytics GA4).</li>
          <li>No other processors are engaged, and we never sell or transfer data for marketing purposes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Your rights</h2>
        <p>
          Under UK/EU GDPR you have the right to access, rectify, erase, restrict, or object to the processing of your
          personal data, and the right to data portability. Because we collect minimal contact information you may need to
          provide contextual details (postcode, delivery date/time, optional note text) so we can locate and act on a
          request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Contact</h2>
        <p>
          For privacy enquiries or to exercise your rights, please open an issue on the project repository at{' '}
          <a
            href="https://github.com/mattkneale/royal-mail-delivery-times/issues"
            className="text-cat-sky hover:text-cat-text"
          >
            github.com/mattkneale/royal-mail-delivery-times/issues
          </a>{' '}
          or email the maintainers via the address published in the repository documentation. We aim to respond within 30
          days.
        </p>
        <p>
          If you are dissatisfied with our response you may raise the matter with the UK Information Commissioner&rsquo;s
          Office (ICO) or your local supervisory authority.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-cat-rosewater">Changes</h2>
        <p>
          We may update this privacy policy to reflect operational or regulatory changes. Significant updates will be
          announced in the repository changelog, and the effective date at the top of this page will be revised.
        </p>
      </section>
    </section>
  );
}
