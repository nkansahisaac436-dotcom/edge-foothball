/**
 * Timezone and Kickoff Time Utilities for Matchday Edge
 * Handles UTC ISO 8601 timestamps and converts accurately to user's timezone.
 */

export function getAutoDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Accra';
  } catch {
    return 'Africa/Accra';
  }
}

export function isValidTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export interface KickoffFormatOptions {
  showDate?: boolean;
  hour12?: boolean;
}

export function formatKickoffTime(
  utcDateStr: string,
  timeZone: string = 'Africa/Accra',
  options?: KickoffFormatOptions
): string {
  if (!utcDateStr) return '--:--';
  const date = new Date(utcDateStr);
  if (isNaN(date.getTime())) {
    return '--:--';
  }

  const validTz = isValidTimezone(timeZone) ? timeZone : 'Africa/Accra';
  const showDate = options?.showDate ?? true;
  const hour12 = options?.hour12 ?? false;

  if (showDate) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: validTz,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12,
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: validTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  }).format(date);
}

export function formatTimeOnly(
  utcDateStr: string,
  timeZone: string = 'Africa/Accra'
): string {
  return formatKickoffTime(utcDateStr, timeZone, { showDate: false, hour12: false });
}
