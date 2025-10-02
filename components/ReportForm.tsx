'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalisePostcodeInput } from '@/lib/postcodes';

interface ReportFormState {
  postcode: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: 'letters' | 'parcels' | 'both';
  note: string;
}

const initialState: ReportFormState = {
  postcode: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryType: 'letters',
  note: ''
};

export function ReportForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [formState, setFormState] = useState<ReportFormState>({
    ...initialState,
    postcode: normalisePostcodeInput(params.get('postcode') ?? '')
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: formState.postcode,
          deliveryDate: formState.deliveryDate,
          deliveryTime: formState.deliveryTime,
          deliveryType: formState.deliveryType,
          note: formState.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? 'Failed to submit report');
      }

      const { normalisedPostcode } = (await response.json()) as { normalisedPostcode: string };
      setStatus('success');
      setFormState(initialState);
      router.push(`/postcode/${encodeURIComponent(normalisedPostcode)}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-cat-subtext0">
          <span className="mb-2 block font-medium text-cat-subtext0">Postcode</span>
          <input
            type="text"
            value={formState.postcode}
            onChange={(event) => updateField('postcode', normalisePostcodeInput(event.target.value))}
            inputMode="text"
            autoCapitalize="characters"
            required
            placeholder="M46 0TF"
          />
        </label>
        <label className="block text-sm text-cat-subtext0">
          <span className="mb-2 block font-medium text-cat-subtext0">Delivery date</span>
          <input
            type="date"
            value={formState.deliveryDate}
            onChange={(event) => updateField('deliveryDate', event.target.value)}
            required
            placeholder="YYYY-MM-DD"
          />
        </label>
        <label className="block text-sm text-cat-subtext0">
          <span className="mb-2 block font-medium text-cat-subtext0">Delivery time</span>
          <input
            type="time"
            value={formState.deliveryTime}
            onChange={(event) => updateField('deliveryTime', event.target.value)}
            required
            placeholder="HH:MM"
          />
        </label>
        <label className="block text-sm text-cat-subtext0">
          <span className="mb-2 block font-medium text-cat-subtext0">Delivery type</span>
          <select
            value={formState.deliveryType}
            onChange={(event) => updateField('deliveryType', event.target.value as ReportFormState['deliveryType'])}
          >
            <option value="letters">Letters</option>
            <option value="parcels">Parcels</option>
            <option value="both">Both</option>
          </select>
        </label>
      </div>
      <label className="block text-sm text-cat-subtext0">
        <span className="mb-2 block font-medium text-cat-subtext0">Optional note</span>
        <textarea
          rows={3}
          value={formState.note}
          onChange={(event) => updateField('note', event.target.value)}
          placeholder="Anything notable about the delivery?"
          className="w-full"
        />
      </label>
      {error && <div className="rounded-md border border-cat-maroon/40 bg-cat-maroon/10 p-3 text-sm text-cat-maroon">{error}</div>}
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Submit delivery report'}
      </button>
      {status === 'success' && (
        <p className="text-sm text-cat-green">Thanks! Redirecting to the postcode summary…</p>
      )}
    </form>
  );
}
