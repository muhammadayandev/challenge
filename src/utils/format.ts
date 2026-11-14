export function formatNasaTimestamp(iso?: string): string {
  if (!iso) return 'Unknown date';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatDelta(value?: number): string {
  if (value === undefined || value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
}
