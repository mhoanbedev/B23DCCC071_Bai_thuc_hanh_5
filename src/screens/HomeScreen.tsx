import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Users } from 'lucide-react-native';

import Button from '../components/Button';
import ConversationRow from '../components/ConversationRow';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import ScreenHeader from '../components/ScreenHeader';
import { useCurrentUid } from '../context/AuthContext';
import { useChatData } from '../context/ChatDataContext';
import { useNow } from '../hooks/useNow';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { Conversation } from '../types/models';
import { isOnline } from '../utils/presence';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const uid = useCurrentUid();
  const { conversations, usersById, presence, totalUnread, loading } = useChatData();
  const now = useNow();

  const openChat = useCallback((peerId: string) => navigation.navigate('Chat', { peerId }), [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationRow
        conversation={item}
        name={usersById[item.peerId]?.name ?? 'Người dùng'}
        online={isOnline(presence[item.peerId])}
        isLastFromMe={item.lastSenderId === uid}
        now={now}
        onPress={openChat}
      />
    ),
    [usersById, presence, uid, now, openChat],
  );

  const subtitle =
    totalUnread > 0 ? `${totalUnread} tin nhắn chưa đọc` : conversations.length > 0 ? 'Bạn đã đọc hết tin nhắn' : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Tin nhắn" subtitle={subtitle} />
      {loading.conversations ? (
        <LoadingView />
      ) : (
        <FlatList
          testID="conversation-list"
          data={conversations}
          keyExtractor={item => item.chatId}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <EmptyState
              icon={<MessageCircle size={28} color={colors.primary} strokeWidth={1.8} />}
              title="Chưa có cuộc trò chuyện"
              description="Chọn một người trong danh bạ để bắt đầu nhắn tin."
              action={
                <Button
                  title="Mở danh bạ"
                  compact
                  variant="secondary"
                  icon={<Users size={18} color={colors.primary} strokeWidth={2} />}
                  onPress={() => navigation.navigate('Contacts')}
                />
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 86,
  },
});
