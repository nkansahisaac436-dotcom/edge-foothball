import { describe, it, expect } from 'vitest';
import {
  formatKickoffTime,
  formatTimeOnly,
  isValidTimezone,
  getAutoDetectedTimezone,
} from '../src/utils/timezone.js';

describe('Timezone & Kickoff Time Conversion', () => {
  // Champions League fixtures on Tuesday 24 Nov 2026
  const fixture1745UTC = '2026-11-24T17:45:00.000Z'; // Bodø/Glimt vs LASK, Galatasaray vs Aston Villa
  const fixture2000UTC = '2026-11-24T20:00:00.000Z'; // Arsenal vs Dortmund, Man City vs Napoli, Real Madrid vs PSV

  it('correctly formats 17:45 UTC kickoff in Africa/Accra (GMT+0)', () => {
    const formatted = formatKickoffTime(fixture1745UTC, 'Africa/Accra');
    expect(formatted).toContain('17:45');
    expect(formatted).toContain('24 Nov');
  });

  it('correctly formats 20:00 UTC kickoff in Africa/Accra (GMT+0)', () => {
    const formatted = formatKickoffTime(fixture2000UTC, 'Africa/Accra');
    expect(formatted).toContain('20:00');
    expect(formatted).toContain('24 Nov');
  });

  it('returns exact time-only string "17:45" and "20:00" in Accra', () => {
    expect(formatTimeOnly(fixture1745UTC, 'Africa/Accra')).toBe('17:45');
    expect(formatTimeOnly(fixture2000UTC, 'Africa/Accra')).toBe('20:00');
  });

  it('correctly converts to European Central Time (Europe/Paris, UTC+1)', () => {
    // 17:45 UTC = 18:45 in Paris (standard winter time in November)
    expect(formatTimeOnly(fixture1745UTC, 'Europe/Paris')).toBe('18:45');
    expect(formatTimeOnly(fixture2000UTC, 'Europe/Paris')).toBe('21:00');
  });

  it('correctly converts to Eastern Time (America/New_York, UTC-5)', () => {
    // 17:45 UTC = 12:45 in New York
    expect(formatTimeOnly(fixture1745UTC, 'America/New_York')).toBe('12:45');
    expect(formatTimeOnly(fixture2000UTC, 'America/New_York')).toBe('15:00');
  });

  it('correctly converts to Tokyo Time (Asia/Tokyo, UTC+9)', () => {
    // 17:45 UTC = 02:45 next day in Tokyo
    expect(formatTimeOnly(fixture1745UTC, 'Asia/Tokyo')).toBe('02:45');
    expect(formatTimeOnly(fixture2000UTC, 'Asia/Tokyo')).toBe('05:00');
  });

  it('validates IANA timezones properly', () => {
    expect(isValidTimezone('Africa/Accra')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Invalid/Fake_Zone')).toBe(false);
  });

  it('falls back safely to Africa/Accra when an invalid timezone is supplied', () => {
    const formatted = formatTimeOnly(fixture1745UTC, 'Invalid/Fake_Zone');
    expect(formatted).toBe('17:45');
  });

  it('handles invalid timestamp strings without throwing or returning "Invalid Date"', () => {
    expect(formatKickoffTime('', 'Africa/Accra')).toBe('--:--');
    expect(formatKickoffTime('not-a-date', 'Africa/Accra')).toBe('--:--');
    expect(formatTimeOnly('invalid', 'Africa/Accra')).toBe('--:--');
  });

  it('returns a valid string from getAutoDetectedTimezone', () => {
    const tz = getAutoDetectedTimezone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });
});
