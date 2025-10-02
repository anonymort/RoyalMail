'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalisePostcodeInput, parsePostcode } from '@/lib/postcodes';

export function PostcodeSearch() {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parsePostcode(postcode);
    if (!parsed) {
      setPostcode(normalisePostcodeInput(postcode));
      return;
    }
    router.push(`/postcode/${encodeURIComponent(parsed.normalised)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        placeholder="Enter postcode (e.g. M46 0TF)"
        value={postcode}
        onChange={(event) => setPostcode(normalisePostcodeInput(event.target.value))}
        className="flex-1"
        required
      />
      <button type="submit">Check delivery times</button>
    </form>
  );
}
