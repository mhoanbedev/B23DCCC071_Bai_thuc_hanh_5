import {
  daysBetween,
  formatClock,
  formatConversationTime,
  formatDayLabel,
  formatLastSeen,
  formatRelative,
} from '../src/utils/time';

const at = (year: number, month: number, day: number, hour = 0, minute = 0) =>
  new Date(year, month - 1, day, hour, minute).getTime();

describe('time utils', () => {
  const now = at(2026, 11, 9, 15, 30);

  test('formats clock with leading zeros', () => {
    expect(formatClock(at(2026, 11, 9, 7, 5))).toBe('07:05');
  });

  test('counts calendar days rather than 24h windows', () => {
    expect(daysBetween(at(2026, 11, 8, 23, 59), at(2026, 11, 9, 0, 1))).toBe(1);
    expect(daysBetween(at(2026, 11, 9, 0, 1), at(2026, 11, 9, 23, 59))).toBe(0);
  });

  test('conversation time adapts to age', () => {
    expect(formatConversationTime(at(2026, 11, 9, 9, 15), now)).toBe('09:15');
    expect(formatConversationTime(at(2026, 11, 8, 22, 0), now)).toBe('Hôm qua');
    expect(formatConversationTime(at(2026, 11, 5, 10, 0), now)).toBe('T5');
    expect(formatConversationTime(at(2026, 10, 1, 10, 0), now)).toBe('01/10');
    expect(formatConversationTime(at(2025, 10, 1, 10, 0), now)).toBe('01/10/2025');
  });

  test('day labels for chat separators', () => {
    expect(formatDayLabel(at(2026, 11, 9, 1, 0), now)).toBe('Hôm nay');
    expect(formatDayLabel(at(2026, 11, 8, 1, 0), now)).toBe('Hôm qua');
    expect(formatDayLabel(at(2026, 11, 2, 1, 0), now)).toBe('02/11/2026');
  });

  test('relative time and last seen', () => {
    expect(formatRelative(now - 20 * 1000, now)).toBe('Vừa xong');
    expect(formatRelative(now - 5 * 60 * 1000, now)).toBe('5 phút trước');
    expect(formatRelative(now - 3 * 60 * 60 * 1000, now)).toBe('3 giờ trước');
    expect(formatLastSeen(now - 5 * 60 * 1000, now)).toBe('Hoạt động 5 phút trước');
    expect(formatLastSeen(now - 10 * 1000, now)).toBe('Hoạt động vừa xong');
    expect(formatLastSeen(undefined, now)).toBe('Ngoại tuyến');
  });
});
