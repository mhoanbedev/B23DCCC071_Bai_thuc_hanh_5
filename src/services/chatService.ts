import {
  increment,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';

import { Conversation, GeoPoint, Message, MessageType } from '../types/models';
import { buildPreview, canSendText, getChatId, sanitizeMessage } from '../utils/chat';
import { db } from './firebase';

const MESSAGE_PAGE_SIZE = 300;

interface OutgoingMessage {
  type: MessageType;
  text?: string;
  location?: GeoPoint;
}

async function sendMessage(senderId: string, receiverId: string, payload: OutgoingMessage): Promise<string> {
  const chatId = getChatId(senderId, receiverId);
  const messageId = push(ref(db, `messages/${chatId}`)).key as string;
  const notificationId = push(ref(db, `notifications/${receiverId}`)).key as string;
  const preview = buildPreview(payload.type, payload.text);
  const timestamp = serverTimestamp();

  const message: Record<string, unknown> = {
    senderId,
    type: payload.type,
    createdAt: timestamp,
  };
  if (payload.type === 'text') {
    message.text = payload.text;
  } else {
    message.location = payload.location;
  }

  const summary = {
    chatId,
    lastMessage: preview,
    lastType: payload.type,
    lastSenderId: senderId,
    updatedAt: timestamp,
  };

  await update(ref(db), {
    [`messages/${chatId}/${messageId}`]: message,
    [`userChats/${senderId}/${chatId}/chatId`]: summary.chatId,
    [`userChats/${senderId}/${chatId}/peerId`]: receiverId,
    [`userChats/${senderId}/${chatId}/lastMessage`]: summary.lastMessage,
    [`userChats/${senderId}/${chatId}/lastType`]: summary.lastType,
    [`userChats/${senderId}/${chatId}/lastSenderId`]: summary.lastSenderId,
    [`userChats/${senderId}/${chatId}/updatedAt`]: summary.updatedAt,
    [`userChats/${receiverId}/${chatId}/chatId`]: summary.chatId,
    [`userChats/${receiverId}/${chatId}/peerId`]: senderId,
    [`userChats/${receiverId}/${chatId}/lastMessage`]: summary.lastMessage,
    [`userChats/${receiverId}/${chatId}/lastType`]: summary.lastType,
    [`userChats/${receiverId}/${chatId}/lastSenderId`]: summary.lastSenderId,
    [`userChats/${receiverId}/${chatId}/updatedAt`]: summary.updatedAt,
    [`userChats/${receiverId}/${chatId}/unread`]: increment(1),
    [`notifications/${receiverId}/${notificationId}`]: {
      type: 'message',
      messageType: payload.type,
      fromId: senderId,
      chatId,
      preview,
      createdAt: timestamp,
      read: false,
    },
  });
  return messageId;
}

export function sendTextMessage(senderId: string, receiverId: string, text: string): Promise<string> {
  if (!canSendText(text)) {
    return Promise.reject(new Error('EMPTY_MESSAGE'));
  }
  return sendMessage(senderId, receiverId, { type: 'text', text: sanitizeMessage(text) });
}

export function sendLocationMessage(senderId: string, receiverId: string, location: GeoPoint): Promise<string> {
  const point: GeoPoint = { latitude: location.latitude, longitude: location.longitude };
  if (typeof location.accuracy === 'number' && Number.isFinite(location.accuracy)) {
    point.accuracy = Math.round(location.accuracy);
  }
  return sendMessage(senderId, receiverId, { type: 'location', location: point });
}

export function subscribeMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
  const messagesQuery = query(ref(db, `messages/${chatId}`), orderByChild('createdAt'), limitToLast(MESSAGE_PAGE_SIZE));
  return onValue(
    messagesQuery,
    snapshot => {
      const messages: Message[] = [];
      snapshot.forEach(child => {
        messages.push({ id: child.key as string, ...(child.val() as Omit<Message, 'id'>) });
      });
      callback(messages);
    },
    () => callback([]),
  );
}

export function subscribeConversations(uid: string, callback: (conversations: Conversation[]) => void): () => void {
  return onValue(
    ref(db, `userChats/${uid}`),
    snapshot => {
      const conversations: Conversation[] = [];
      snapshot.forEach(child => {
        const value = child.val() as Partial<Conversation>;
        if (!value.peerId || !value.updatedAt) {
          return;
        }
        conversations.push({
          chatId: child.key as string,
          peerId: value.peerId,
          lastMessage: value.lastMessage ?? '',
          lastType: value.lastType ?? 'text',
          lastSenderId: value.lastSenderId ?? '',
          updatedAt: value.updatedAt,
          unread: value.unread ?? 0,
        });
      });
      conversations.sort((a, b) => b.updatedAt - a.updatedAt);
      callback(conversations);
    },
    () => callback([]),
  );
}

export function markConversationRead(uid: string, chatId: string): Promise<void> {
  return update(ref(db, `userChats/${uid}/${chatId}`), { unread: 0 });
}
