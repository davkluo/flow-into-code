/**
 * Returns a human-readable string representing the time remaining until the
 * next UTC midnight, e.g. "3h 42m" or "55m".
 */
export function timeUntilMidnightUTC(): string {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const totalMinutes = Math.floor(
    (nextMidnight.getTime() - now.getTime()) / (1000 * 60),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
