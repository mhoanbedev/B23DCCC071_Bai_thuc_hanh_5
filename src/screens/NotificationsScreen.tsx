import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellOff, CheckCheck, MapPin, MessageCircle } from 'lucide-react-native';

import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import ScreenHeader from '../components/ScreenHeader';
import { useCurrentUid } from '../context/AuthContext';
import { useChatData } from '../context/ChatDataContext';
import { useNow } from '../hooks/useNow';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { markNotificationsRead } from '../services/notificationService';
import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';
import { AppNotification } from '../types/models';
import { formatRelative } from '../utils/time';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Notifications'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function NotificationsScreen({ navigation }: Props) {
  const uid = useCurrentUid();
  const { notifications, unreadNotifications, usersById, loading } = useChatData();
  const now = useNow();

  const markAllRead = () => {
    const ids = notifications.filter(item => !item.read).map(item => item.id);
    markNotificationsRead(uid, ids).catch(() => undefined);
  };

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const sender = usersById[item.fromId];
      const senderName = sender?.name ?? 'Người dùng';
      const isLocation = item.messageType === 'location';
      return (
        <Pressable
          testID={`notification-${item.id}`}
          onPress={() => {
            if (!item.read) {
              markNotificationsRead(uid, [item.id]).catch(() => undefined);
            }
            navigation.navigate('Chat', { peerId: item.fromId });
          }}
          android_ripple={{ color: colors.divider }}
          style={({ pressed }) => [styles.row, !item.read && styles.rowUnread, pressed && styles.pressed]}
        >
          <View>
            <Avatar name={senderName} seed={item.fromId} size={48} />
            <View style={styles.kind}>
              {isLocation ? (
                <MapPin size={11} color={colors.onPrimary} strokeWidth={2.4} />
              ) : (
                <MessageCircle size={11} color={colors.onPrimary} strokeWidth={2.4} />
              )}
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>
              <Text style={styles.strong}>{senderName}</Text>
              {isLocation ? ' đã chia sẻ vị trí với bạn' : ' đã gửi cho bạn một tin nhắn'}
            </Text>
            {!isLocation ? (
              <Text style={styles.preview} numberOfLines={1}>
                “{item.preview}”
              </Text>
            ) : null}
            <Text style={[styles.time, !item.read && styles.timeUnread]}>{formatRelative(item.createdAt, now)}</Text>
          </View>
          {!item.read ? <View style={styles.dot} /> : null}
        </Pressable>
      );
    },
    [usersById, uid, navigation, now],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Thông báo"
        subtitle={unreadNotifications > 0 ? `${unreadNotifications} thông báo mới` : undefined}
        right={
          unreadNotifications > 0 ? (
            <Pressable
              testID="mark-all-read"
              onPress={markAllRead}
              hitSlop={8}
              style={({ pressed }) => [styles.markAll, pressed && styles.markAllPressed]}
            >
              <CheckCheck size={16} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </Pressable>
          ) : null
        }
      />
      {loading.notifications ? (
        <LoadingView />
      ) : (
        <FlatList
          testID="notification-list"
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <EmptyState
              icon={<BellOff size={28} color={colors.primary} strokeWidth={1.8} />}
              title="Chưa có thông báo"
              description="Bạn sẽ nhận được thông báo khi có tin nhắn mới."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowUnread: {
    backgroundColor: '#F5F8FE',
  },
  pressed: {
    backgroundColor: colors.background,
  },
  kind: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  strong: {
    fontWeight: '700',
  },
  preview: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  timeUnread: {
    color: colors.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginLeft: spacing.sm,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  markAllPressed: {
    opacity: 0.8,
  },
  markAllText: {
    ...typography.smallStrong,
    color: colors.primary,
    marginLeft: 6,
  },
});
