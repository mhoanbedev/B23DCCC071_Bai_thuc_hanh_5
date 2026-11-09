import { GeoPoint, Message, MessageType } from '../types/models';
import { formatDayLabel, isSameDay } from './time';

export const MAX_MESSAGE_LENGTH = 2000;

export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

export function getPeerId(chatId: string, myUid: string): string {
  const [first, second] = chatId.split('_');
  return first === myUid ? second : first;
}

export function sanitizeMessage(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

export function canSendText(text: string): boolean {
  const value = sanitizeMessage(text);
  return value.length > 0 && value.length <= MAX_MESSAGE_LENGTH;
}

export function buildPreview(type: MessageType, text?: string): string {
  if (type === 'location') {
    return 'Đã chia sẻ vị trí';
  }
  const value = (text ?? '').replace(/\s+/g, ' ').trim();
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export function formatCoordinates(point: GeoPoint): string {
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}

export function buildMapUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}

export type ChatListItem =
  | { kind: 'day'; key: string; label: string }
  | {
      kind: 'message';
      key: string;
      message: Message;
      isMine: boolean;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
    };

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function buildChatItems(messages: Message[], myUid: string, now: number = Date.now()): ChatListItem[] {
  const items: ChatListItem[] = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const startsDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
    if (startsDay) {
      items.push({
        kind: 'day',
        key: `day-${message.id}`,
        label: formatDayLabel(message.createdAt, now),
      });
    }
    const joinsPrevious =
      !startsDay &&
      !!previous &&
      previous.senderId === message.senderId &&
      message.createdAt - previous.createdAt < GROUP_WINDOW_MS;
    const joinsNext =
      !!next &&
      next.senderId === message.senderId &&
      isSameDay(next.createdAt, message.createdAt) &&
      next.createdAt - message.createdAt < GROUP_WINDOW_MS;
    items.push({
      kind: 'message',
      key: message.id,
      message,
      isMine: message.senderId === myUid,
      isFirstInGroup: !joinsPrevious,
      isLastInGroup: !joinsNext,
    });
  });
  return items;
}
