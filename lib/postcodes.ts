export interface PostcodeParts {
  normalised: string;
  outwardSector: string;
}

export function parsePostcode(input: string): PostcodeParts | null {
  if (!input) return null;
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = cleaned.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);
  if (!match) {
    return null;
  }
  const outward = match[1];
  const inward = match[2];
  const normalised = `${outward} ${inward}`;
  const outwardSector = `${outward} ${inward.charAt(0)}`;
  return { normalised, outwardSector };
}

export function formatPostcodeForDisplay(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\s+/g, ' ');
}
