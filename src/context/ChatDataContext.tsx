import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { subscribeConversations } from '../services/chatService';
import { subscribeNotifications } from '../services/notificationService';
import { subscribePresenceMap } from '../services/presenceService';
import { subscribeUsers } from '../services/userService';
import { AppNotification, Conversation, PresenceMap, UserProfile } from '../types/models';
import { useCurrentUid } from './AuthContext';

interface ChatDataValue {
  contacts: UserProfile[];
  usersById: Record<string, UserProfile>;
  presence: PresenceMap;
  conversations: Conversation[];
  notifications: AppNotification[];
  totalUnread: number;
  unreadNotifications: number;
  loading: {
    contacts: boolean;
    conversations: boolean;
    notifications: boolean;
  };
}

const ChatDataContext = createContext<ChatDataValue | null>(null);

export function ChatDataProvider({ children }: { children: ReactNode }) {
  const uid = useCurrentUid();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<PresenceMap>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  useEffect(() => {
    if (!uid) {
      return;
    }
    const unsubscribeUsers = subscribeUsers(next => {
      setUsers(next);
      setUsersLoaded(true);
    });
    const unsubscribePresence = subscribePresenceMap(setPresence);
    const unsubscribeConversations = subscribeConversations(uid, next => {
      setConversations(next);
      setConversationsLoaded(true);
    });
    const unsubscribeNotifications = subscribeNotifications(uid, next => {
      setNotifications(next);
      setNotificationsLoaded(true);
    });
    return () => {
      unsubscribeUsers();
      unsubscribePresence();
      unsubscribeConversations();
      unsubscribeNotifications();
    };
  }, [uid]);

  const value = useMemo<ChatDataValue>(() => {
    const usersById: Record<string, UserProfile> = {};
    users.forEach(item => {
      usersById[item.uid] = item;
    });
    return {
      contacts: users.filter(item => item.uid !== uid),
      usersById,
      presence,
      conversations,
      notifications,
      totalUnread: conversations.reduce((sum, item) => sum + (item.unread > 0 ? item.unread : 0), 0),
      unreadNotifications: notifications.filter(item => !item.read).length,
      loading: {
        contacts: !usersLoaded,
        conversations: !conversationsLoaded,
        notifications: !notificationsLoaded,
      },
    };
  }, [users, uid, presence, conversations, notifications, usersLoaded, conversationsLoaded, notificationsLoaded]);

  return <ChatDataContext.Provider value={value}>{children}</ChatDataContext.Provider>;
}

export function useChatData(): ChatDataValue {
  const value = useContext(ChatDataContext);
  if (!value) {
    throw new Error('useChatData must be used inside ChatDataProvider');
  }
  return value;
}
