import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchX, Users } from 'lucide-react-native';

import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useChatData } from '../context/ChatDataContext';
import { useNow } from '../hooks/useNow';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import typography, { spacing } from '../theme/typography';
import { UserProfile } from '../types/models';
import { getPresenceLabel, isOnline } from '../utils/presence';
import { matchesQuery } from '../utils/text';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ContactSection {
  title: string;
  data: UserProfile[];
}

export default function ContactsScreen({ navigation }: Props) {
  const { contacts, presence, loading } = useChatData();
  const [query, setQuery] = useState('');
  const now = useNow();

  const filtered = useMemo(
    () => contacts.filter(contact => matchesQuery(query, contact.name, contact.email)),
    [contacts, query],
  );

  const sections = useMemo<ContactSection[]>(() => {
    const online = filtered.filter(contact => isOnline(presence[contact.uid]));
    const offline = filtered.filter(contact => !isOnline(presence[contact.uid]));
    const result: ContactSection[] = [];
    if (online.length > 0) {
      result.push({ title: `Đang hoạt động · ${online.length}`, data: online });
    }
    if (offline.length > 0) {
      result.push({ title: `Ngoại tuyến · ${offline.length}`, data: offline });
    }
    return result;
  }, [filtered, presence]);

  const onlineCount = contacts.filter(contact => isOnline(presence[contact.uid])).length;

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => {
      const status = presence[item.uid];
      const online = isOnline(status);
      return (
        <Pressable
          testID={`contact-${item.uid}`}
          onPress={() => navigation.navigate('Chat', { peerId: item.uid })}
          android_ripple={{ color: colors.divider }}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Avatar name={item.name} seed={item.uid} size={48} online={online} showPresence />
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.status, online && styles.statusOnline]} numberOfLines={1}>
              {getPresenceLabel(status, now)}
            </Text>
          </View>
        </Pressable>
      );
    },
    [presence, navigation, now],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Danh bạ"
        subtitle={loading.contacts ? undefined : `${contacts.length} người dùng · ${onlineCount} đang hoạt động`}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm theo tên hoặc email" />
      {loading.contacts ? (
        <LoadingView />
      ) : (
        <SectionList
          testID="contact-list"
          sections={sections}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            contacts.length === 0 ? (
              <EmptyState
                icon={<Users size={28} color={colors.primary} strokeWidth={1.8} />}
                title="Chưa có người dùng khác"
                description="Khi bạn bè đăng ký tài khoản, họ sẽ xuất hiện ở đây."
              />
            ) : (
              <EmptyState
                icon={<SearchX size={28} color={colors.primary} strokeWidth={1.8} />}
                title="Không tìm thấy kết quả"
                description={`Không có ai khớp với “${query.trim()}”.`}
              />
            )
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
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  status: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusOnline: {
    color: colors.online,
    fontWeight: '600',
  },
});
