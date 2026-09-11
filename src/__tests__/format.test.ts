import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatTime,
  huntingSeason,
} from '../format';

describe('formatDuration', () => {
  const start = '2026-09-11T06:00:00.000Z';

  it('returns null when the trip has no end time', () => {
    expect(formatDuration(start, null)).toBeNull();
  });

  it('shows minutes only under an hour', () => {
    expect(formatDuration(start, '2026-09-11T06:45:00.000Z')).toBe('45 min');
  });

  it('drops the minutes when they are zero', () => {
    expect(formatDuration(start, '2026-09-11T09:00:00.000Z')).toBe('3 h');
  });

  it('shows hours and minutes together', () => {
    expect(formatDuration(start, '2026-09-11T08:20:00.000Z')).toBe('2 h 20 min');
  });

  it('rounds to the nearest minute', () => {
    expect(formatDuration(start, '2026-09-11T06:01:40.000Z')).toBe('2 min');
  });

  // An end time before the start means the data is wrong. Returning null keeps
  // "-45 min" off the screen.
  it('returns null when the end precedes the start', () => {
    expect(formatDuration(start, '2026-09-11T05:15:00.000Z')).toBeNull();
  });

  it('handles a trip crossing midnight', () => {
    expect(formatDuration('2026-09-11T22:30:00.000Z', '2026-09-12T02:00:00.000Z')).toBe('3 h 30 min');
  });
});

describe('huntingSeason', () => {
  // The season runs 1 August to 31 July, so the boundary is what matters.
  it('labels August as the start of the new season', () => {
    expect(huntingSeason(new Date(2026, 7, 1)).label).toBe('2026–27');
  });

  it('keeps July in the previous season', () => {
    expect(huntingSeason(new Date(2026, 6, 31)).label).toBe('2025–26');
  });

  it('keeps January in the season that began the previous August', () => {
    expect(huntingSeason(new Date(2026, 0, 15)).label).toBe('2025–26');
  });

  it('spans exactly one year', () => {
    const s = huntingSeason(new Date(2026, 8, 11));
    expect(s.start.getFullYear()).toBe(2026);
    expect(s.start.getMonth()).toBe(7); // elokuu
    expect(s.start.getDate()).toBe(1);
    expect(s.end.getFullYear()).toBe(2027);
    expect(s.end.getMonth()).toBe(6); // heinäkuu
    expect(s.end.getDate()).toBe(31);
  });

  it('places a date inside its own season range', () => {
    const d = new Date(2026, 10, 20);
    const s = huntingSeason(d);
    expect(d >= s.start && d <= s.end).toBe(true);
  });
});

describe('date formatting', () => {
  const iso = '2026-09-11T14:05:00.000Z';

  it('formats a date as d.M.yyyy', () => {
    expect(formatDate(iso)).toBe('11.9.2026');
  });

  // Note: the Finnish locale separates hours and minutes with a dot in
  // toLocaleTimeString, but the app deliberately renders HH:mm with a colon.
  // Assert the shape and the value, not the platform's locale formatting.
  it('formats time as HH:mm with a colon, in the local zone', () => {
    const d = new Date(iso);
    const expected =
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    expect(formatTime(iso)).toBe(expected);
    expect(formatTime(iso)).toMatch(/^\d{2}:\d{2}$/);
  });

  it('combines date and time', () => {
    expect(formatDateTime(iso)).toBe(`11.9.2026 ${formatTime(iso)}`);
  });
});
