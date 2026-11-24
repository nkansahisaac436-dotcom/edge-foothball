/**
 * Safe Date Formatting & Relative Time Utilities
 * Guarantees that "Invalid Date" is NEVER rendered to the user.
 */

export { formatKickoffTime } from './timezone.js';

export function formatRelativeTime(timestamp: string | number | Date | null | undefined): string {
  if (!timestamp) {
    return 'Updating…';
  }

  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    // If it's a string, try standard parsing
    date = new Date(timestamp);
    // If isNaN, try prepending today's date if it was just a time string
    if (isNaN(date.getTime()) && typeof timestamp === 'string') {
      const today = new Date().toISOString().split('T')[0];
      const parsedWithDate = new Date(`${today}T${timestamp}`);
      if (!isNaN(parsedWithDate.getTime())) {
        date = parsedWithDate;
      }
    }
  }

  if (isNaN(date.getTime())) {
    return 'Updating…';
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) {
    return 'Updated just now';
  }
  if (diffSec < 60) {
    return 'Updated < 1 min ago';
  }
  if (diffMin === 1) {
    return 'Updated 1 min ago';
  }
  if (diffMin < 60) {
    return `Updated ${diffMin} min ago`;
  }

  const hours = Math.floor(diffMin / 60);
  if (hours === 1) {
    return 'Updated 1 hr ago';
  }
  if (hours < 24) {
    return `Updated ${hours} hrs ago`;
  }

  return `Updated ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}
