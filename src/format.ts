import { format, isThisYear, isToday, isYesterday } from 'date-fns';
import { fi } from 'date-fns/locale';

export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return 'Tänään';
  if (isYesterday(d)) return 'Eilen';
  return format(d, isThisYear(d) ? 'EEEEEE d.M.' : 'd.M.yyyy', { locale: fi });
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'd.M.yyyy', { locale: fi });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: fi });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'd.M.yyyy HH:mm', { locale: fi });
}

export function formatDuration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null;
  const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (minutes < 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Metsästyskausi alkaa 1.8. — kauden 2025 nimi on "2025–26". */
export function huntingSeason(date: Date = new Date()): { start: Date; end: Date; label: string } {
  const y = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
  return {
    start: new Date(y, 7, 1),
    end: new Date(y + 1, 6, 31, 23, 59, 59),
    label: `${y}–${String(y + 1).slice(2)}`,
  };
}
