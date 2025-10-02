'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function normalisePostcode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/(.{3,4})(.*)/, (_, outward, inward) => `${outward} ${inward}`.trim());
}

export function PostcodeSearch() {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalised = normalisePostcode(postcode);
    if (!normalised) return;
    router.push(`/postcode/${encodeURIComponent(normalised)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        placeholder="Enter postcode (e.g. M46 0TF)"
        value={postcode}
        onChange={(event) => setPostcode(event.target.value)}
        className="flex-1"
        required
      />
      <button type="submit">Check delivery times</button>
    </form>
  );
}
