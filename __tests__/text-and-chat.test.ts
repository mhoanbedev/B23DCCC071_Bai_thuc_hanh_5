import { Message } from '../src/types/models';
import {
  buildChatItems,
  buildMapUrl,
  buildPreview,
  canSendText,
  formatCoordinates,
  getChatId,
  getPeerId,
  MAX_MESSAGE_LENGTH,
  sanitizeMessage,
} from '../src/utils/chat';
import { getPresenceLabel, isOnline } from '../src/utils/presence';
import { getInitials, matchesQuery, normalizeText } from '../src/utils/text';

describe('text utils', () => {
  test('normalizes Vietnamese diacritics for search', () => {
    expect(normalizeText('  Đặng Thị Ánh  ')).toBe('dang thi anh');
    expect(matchesQuery('anh', 'Đặng Thị Ánh')).toBe(true);
    expect(matchesQuery('HOA', 'Nguyễn Văn Hòa', 'hoa@test.dev')).toBe(true);
    expect(matchesQuery('xyz', 'Nguyễn Văn Hòa', 'hoa@test.dev')).toBe(false);
    expect(matchesQuery('   ', 'Ai cũng khớp')).toBe(true);
  });

  test('builds initials from first and last word', () => {
    expect(getInitials('Vũ Minh Hoàn')).toBe('VH');
    expect(getInitials('lan')).toBe('L');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('chat utils', () => {
  test('chat id is stable regardless of order', () => {
    expect(getChatId('b', 'a')).toBe('a_b');
    expect(getChatId('a', 'b')).toBe('a_b');
    expect(getPeerId('a_b', 'a')).toBe('b');
    expect(getPeerId('a_b', 'b')).toBe('a');
  });

  test('rejects empty or whitespace-only messages', () => {
    expect(canSendText('')).toBe(false);
    expect(canSendText('   \n\t ')).toBe(false);
    expect(canSendText(' chào ')).toBe(true);
    expect(canSendText('x'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false);
    expect(sanitizeMessage('  dòng 1\r\ndòng 2  ')).toBe('dòng 1\ndòng 2');
  });

  test('previews', () => {
    expect(buildPreview('location')).toBe('Đã chia sẻ vị trí');
    expect(buildPreview('text', 'xin\n  chào')).toBe('xin chào');
    expect(buildPreview('text', 'a'.repeat(200))).toHaveLength(120);
  });

  test('location helpers', () => {
    const point = { latitude: 21.028511, longitude: 105.804817 };
    expect(formatCoordinates(point)).toBe('21.02851, 105.80482');
    expect(buildMapUrl(point)).toBe('https://www.google.com/maps/search/?api=1&query=21.028511,105.804817');
  });

  test('groups messages and inserts day separators', () => {
    const base = new Date(2026, 10, 8, 23, 50).getTime();
    const messages: Message[] = [
      { id: '1', senderId: 'me', type: 'text', text: 'a', createdAt: base },
      { id: '2', senderId: 'me', type: 'text', text: 'b', createdAt: base + 60 * 1000 },
      { id: '3', senderId: 'you', type: 'text', text: 'c', createdAt: base + 2 * 60 * 1000 },
      { id: '4', senderId: 'you', type: 'text', text: 'd', createdAt: base + 15 * 60 * 1000 },
    ];
    const items = buildChatItems(messages, 'me', base + 20 * 60 * 1000);
    expect(items.map(item => (item.kind === 'day' ? `day:${item.label}` : item.key))).toEqual([
      'day:Hôm qua',
      '1',
      '2',
      '3',
      'day:Hôm nay',
      '4',
    ]);
    const bubbles = items.filter(item => item.kind === 'message');
    expect(bubbles.map(item => item.kind === 'message' && [item.isMine, item.isFirstInGroup, item.isLastInGroup])).toEqual([
      [true, true, false],
      [true, false, true],
      [false, true, true],
      [false, true, true],
    ]);
  });
});

describe('presence utils', () => {
  test('labels', () => {
    const now = Date.now();
    expect(isOnline({ state: 'online', lastChanged: now })).toBe(true);
    expect(getPresenceLabel({ state: 'online', lastChanged: now }, now)).toBe('Đang hoạt động');
    expect(getPresenceLabel({ state: 'offline', lastChanged: now - 2 * 60 * 1000 }, now)).toBe('Hoạt động 2 phút trước');
    expect(getPresenceLabel(undefined, now)).toBe('Ngoại tuyến');
  });
});
