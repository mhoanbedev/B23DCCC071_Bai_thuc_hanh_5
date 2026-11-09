const mockUpdate = jest.fn((..._args: unknown[]) => Promise.resolve());
const mockUnsubscribe = jest.fn();
let mockPushCounter = 0;

jest.mock('../src/services/firebase', () => ({ db: {} }));

jest.mock('firebase/database', () => ({
  ref: (_db: unknown, path?: string) => ({ path: path ?? '' }),
  push: () => {
    mockPushCounter += 1;
    return { key: `key${mockPushCounter}` };
  },
  update: (...args: unknown[]) => mockUpdate(...args),
  increment: (value: number) => ({ increment: value }),
  serverTimestamp: () => 'SERVER_TS',
  query: (...args: unknown[]) => args,
  orderByChild: (key: string) => ({ orderByChild: key }),
  limitToLast: (count: number) => ({ limitToLast: count }),
  onValue: jest.fn(() => mockUnsubscribe),
}));

import { onValue } from 'firebase/database';

import {
  markConversationRead,
  sendLocationMessage,
  sendTextMessage,
  subscribeConversations,
  subscribeMessages,
} from '../src/services/chatService';

beforeEach(() => {
  mockUpdate.mockClear();
  mockPushCounter = 0;
});

describe('chatService', () => {
  test('sending text writes message, both inboxes, unread increment and notification in one update', async () => {
    await sendTextMessage('uidB', 'uidA', '  Xin chào  ');
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const [, updates] = mockUpdate.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(updates['messages/uidA_uidB/key1']).toEqual({
      senderId: 'uidB',
      type: 'text',
      text: 'Xin chào',
      createdAt: 'SERVER_TS',
    });
    expect(updates['userChats/uidA/uidA_uidB/unread']).toEqual({ increment: 1 });
    expect(updates['userChats/uidB/uidA_uidB/unread']).toBeUndefined();
    expect(updates['userChats/uidA/uidA_uidB/peerId']).toBe('uidB');
    expect(updates['userChats/uidB/uidA_uidB/peerId']).toBe('uidA');
    expect(updates['userChats/uidA/uidA_uidB/lastMessage']).toBe('Xin chào');
    expect(updates['notifications/uidA/key2']).toMatchObject({
      fromId: 'uidB',
      messageType: 'text',
      read: false,
      preview: 'Xin chào',
    });
  });

  test('empty messages are rejected before touching the database', async () => {
    await expect(sendTextMessage('uidB', 'uidA', '   ')).rejects.toThrow('EMPTY_MESSAGE');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('location messages carry coordinates and rounded accuracy', async () => {
    await sendLocationMessage('uidA', 'uidB', { latitude: 21.03, longitude: 105.85, accuracy: 12.7 });
    const [, updates] = mockUpdate.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(updates['messages/uidA_uidB/key1']).toEqual({
      senderId: 'uidA',
      type: 'location',
      location: { latitude: 21.03, longitude: 105.85, accuracy: 13 },
      createdAt: 'SERVER_TS',
    });
    expect(updates['userChats/uidB/uidA_uidB/lastMessage']).toBe('Đã chia sẻ vị trí');
    expect(updates['userChats/uidB/uidA_uidB/lastType']).toBe('location');
  });

  test('marking a conversation read resets unread to zero', async () => {
    await markConversationRead('uidA', 'uidA_uidB');
    expect(mockUpdate).toHaveBeenCalledWith({ path: 'userChats/uidA/uidA_uidB' }, { unread: 0 });
  });

  test('subscriptions return the listener unsubscribe function', () => {
    const callback = jest.fn();
    expect(subscribeMessages('uidA_uidB', callback)).toBe(mockUnsubscribe);
    expect(subscribeConversations('uidA', callback)).toBe(mockUnsubscribe);
  });

  test('conversations are sorted newest first and incomplete rows are skipped', () => {
    const callback = jest.fn();
    subscribeConversations('me', callback);
    const listener = (onValue as jest.Mock).mock.calls.at(-1)[1];
    const rows: Record<string, object> = {
      c1: { peerId: 'p1', updatedAt: 100, lastMessage: 'cũ', lastType: 'text', lastSenderId: 'p1', unread: 2 },
      c2: { peerId: 'p2', updatedAt: 300, lastMessage: 'mới', lastType: 'text', lastSenderId: 'me' },
      c3: { unread: 0 },
    };
    listener({
      forEach: (fn: (child: { key: string; val: () => object }) => void) =>
        Object.entries(rows).forEach(([key, value]) => fn({ key, val: () => value })),
    });
    const result = callback.mock.calls[0][0];
    expect(result.map((item: { chatId: string }) => item.chatId)).toEqual(['c2', 'c1']);
    expect(result[0].unread).toBe(0);
    expect(result[1].unread).toBe(2);
  });
});
