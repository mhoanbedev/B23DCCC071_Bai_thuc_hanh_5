export type PresenceState = 'online' | 'offline';

export interface UserProfile {
  uid: string;
  name: string;
  nameLower: string;
  email: string;
  createdAt: number;
}

export interface Presence {
  state: PresenceState;
  lastChanged: number;
}

export type PresenceMap = Record<string, Presence>;

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type MessageType = 'text' | 'location';

export interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  location?: GeoPoint;
  createdAt: number;
}

export interface Conversation {
  chatId: string;
  peerId: string;
  lastMessage: string;
  lastType: MessageType;
  lastSenderId: string;
  updatedAt: number;
  unread: number;
}

export interface AppNotification {
  id: string;
  type: 'message';
  messageType: MessageType;
  fromId: string;
  chatId: string;
  preview: string;
  createdAt: number;
  read: boolean;
}
