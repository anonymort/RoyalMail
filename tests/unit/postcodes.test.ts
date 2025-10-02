import { describe, expect, it } from 'vitest';
import {
  formatPostcodeForDisplay,
  isValidPostcode,
  normalisePostcodeInput,
  parsePostcode
} from '@/lib/postcodes';

describe('postcodes helpers', () => {
  it('parses standard postcode formats', () => {
    const result = parsePostcode('m46 0tf');
    expect(result).toEqual({ normalised: 'M46 0TF', outwardSector: 'M46 0' });
  });

  it('handles the GIR 0AA special case', () => {
    const result = parsePostcode('gir0aa');
    expect(result).toEqual({ normalised: 'GIR 0AA', outwardSector: 'GIR 0' });
  });

  it('returns null for invalid postcodes', () => {
    expect(parsePostcode('12345')).toBeNull();
    expect(parsePostcode('SW1')).toBeNull();
  });

  it('normalises user input by removing invalid characters and spacing', () => {
    expect(normalisePostcodeInput(' sw1!a 1aa ')).toBe('SW1A 1AA');
  });

  it('formats postcode for display even when parsing fails', () => {
    expect(formatPostcodeForDisplay('sw1a1aa')).toBe('SW1A 1AA');
    expect(formatPostcodeForDisplay('not-a-code')).toBe('NOTAC ODE');
  });

  it('validates postcodes using the parser', () => {
    expect(isValidPostcode('SW1A 1AA')).toBe(true);
    expect(isValidPostcode('SW1')).toBe(false);
  });
});
