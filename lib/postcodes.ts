interface ParsedPostcode {
  outward: string;
  inward: string;
}

const POSTCODE_REGEX = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/;
const SPECIAL_CASES: Record<string, ParsedPostcode> = {
  GIR0AA: { outward: 'GIR', inward: '0AA' }
};

function cleanPostcode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function applyCanonicalSpacing(cleaned: string): string {
  if (!cleaned) {
    return '';
  }
  if (cleaned.length <= 4) {
    return cleaned;
  }
  return `${cleaned.slice(0, cleaned.length - 3)} ${cleaned.slice(-3)}`;
}

export interface PostcodeParts {
  normalised: string;
  outwardSector: string;
}

export function parsePostcode(input: string): PostcodeParts | null {
  if (!input) return null;
  const cleaned = cleanPostcode(input);
  const special = SPECIAL_CASES[cleaned];

  const parts = special ?? (() => {
    const match = cleaned.match(POSTCODE_REGEX);
    if (!match) return null;
    return { outward: match[1], inward: match[2] } satisfies ParsedPostcode;
  })();

  if (!parts) {
    return null;
  }

  const normalised = `${parts.outward} ${parts.inward}`;
  const outwardSector = `${parts.outward} ${parts.inward.charAt(0)}`;
  return { normalised, outwardSector };
}

export function normalisePostcodeInput(value: string): string {
  const cleaned = cleanPostcode(value);
  return applyCanonicalSpacing(cleaned);
}

export function formatPostcodeForDisplay(postcode: string): string {
  const parsed = parsePostcode(postcode);
  if (parsed) {
    return parsed.normalised;
  }
  const cleaned = cleanPostcode(postcode);
  return applyCanonicalSpacing(cleaned);
}

export function isValidPostcode(postcode: string): boolean {
  return Boolean(parsePostcode(postcode));
}
