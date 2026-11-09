import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';

import Avatar from '../components/Avatar';
import ChatHeader from '../components/chat/ChatHeader';
import Composer from '../components/chat/Composer';
import DaySeparator from '../components/chat/DaySeparator';
import MessageBubble from '../components/chat/MessageBubble';
import LoadingView from '../components/LoadingView';
import { useCurrentUid } from '../context/AuthContext';
import { useChatData } from '../context/ChatDataContext';
import { useKeyboardVisible } from '../hooks/useKeyboardVisible';
import { useMessages } from '../hooks/useMessages';
import { useNow } from '../hooks/useNow';
import { RootStackParamList } from '../navigation/types';
import { markConversationRead, sendLocationMessage, sendTextMessage } from '../services/chatService';
import { getCurrentLocation, getLocationErrorMessage } from '../services/locationService';
import { markNotificationsRead } from '../services/notificationService';
import colors from '../theme/colors';
import typography, { spacing } from '../theme/typography';
import { buildChatItems, ChatListItem, getChatId } from '../utils/chat';
import { getPresenceLabel, isOnline } from '../utils/presence';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ navigation, route }: Props) {
  const { peerId } = route.params;
  const uid = useCurrentUid();
  const chatId = getChatId(uid, peerId);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const now = useNow();
  const keyboardVisible = useKeyboardVisible();
  const listRef = useRef<FlatList<ChatListItem>>(null);
  const { usersById, presence, conversations, notifications } = useChatData();
  const { messages, loading } = useMessages(chatId);

  const peer = usersById[peerId];
  const peerName = peer?.name ?? 'Người dùng';
  const peerPresence = presence[peerId];
  const online = isOnline(peerPresence);
  const unread = conversations.find(item => item.chatId === chatId)?.unread ?? 0;

  const items = useMemo(() => buildChatItems(messages, uid, now).reverse(), [messages, uid, now]);

  useEffect(() => {
    if (isFocused && unread > 0) {
      markConversationRead(uid, chatId).catch(() => undefined);
    }
  }, [isFocused, unread, uid, chatId]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    const ids = notifications.filter(item => item.chatId === chatId && !item.read).map(item => item.id);
    markNotificationsRead(uid, ids).catch(() => undefined);
  }, [isFocused, notifications, uid, chatId]);

  const latestId = messages.length > 0 ? messages[messages.length - 1].id : '';
  useEffect(() => {
    if (latestId) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [latestId]);

  const handleSendText = useCallback(
    async (text: string) => {
      try {
        await sendTextMessage(uid, peerId, text);
      } catch (error) {
        Alert.alert('Chưa gửi được tin nhắn', 'Kiểm tra kết nối mạng rồi thử lại.');
        throw error;
      }
    },
    [uid, peerId],
  );

  const handleSendLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      await sendLocationMessage(uid, peerId, location);
    } catch (error) {
      Alert.alert('Không thể chia sẻ vị trí', getLocationErrorMessage(error));
    }
  }, [uid, peerId]);

  const renderItem = useCallback(({ item }: { item: ChatListItem }) => {
    if (item.kind === 'day') {
      return <DaySeparator label={item.label} />;
    }
    return (
      <MessageBubble
        message={item.message}
        isMine={item.isMine}
        isFirstInGroup={item.isFirstInGroup}
        isLastInGroup={item.isLastInGroup}
      />
    );
  }, []);

  return (
    <View style={styles.screen}>
      <ChatHeader
        name={peerName}
        peerId={peerId}
        online={online}
        statusLabel={getPresenceLabel(peerPresence, now)}
        topInset={insets.top}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {loading ? (
          <LoadingView />
        ) : (
          <FlatList
            ref={listRef}
            testID="message-list"
            data={items}
            inverted
            keyExtractor={item => item.key}
            renderItem={renderItem}
            contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 120 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Avatar name={peerName} seed={peerId} size={72} />
                <Text style={styles.emptyTitle}>{peerName}</Text>
                <Text style={styles.emptyText}>Hãy gửi lời chào để bắt đầu cuộc trò chuyện.</Text>
                <View style={styles.secure}>
                  <Lock size={12} color={colors.textMuted} strokeWidth={2} />
                  <Text style={styles.secureText}>Chỉ bạn và {peerName} xem được tin nhắn này</Text>
                </View>
              </View>
            }
          />
        )}
        <Composer onSendText={handleSendText} onSendLocation={handleSendLocation} bottomInset={keyboardVisible ? 0 : insets.bottom} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.chatBackground,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    transform: [{ scaleY: -1 }],
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(24, 32, 43, 0.05)',
  },
  secureText: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 6,
  },
});
