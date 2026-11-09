import React, { ReactNode, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Info, LogOut, Mail, ShieldCheck, User } from 'lucide-react-native';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useChatData } from '../context/ChatDataContext';
import { logout } from '../services/authService';
import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';
import { isOnline } from '../utils/presence';
import { formatDate } from '../utils/time';

function InfoRow({ icon, label, value, last = false }: { icon: ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoIcon}>{icon}</View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, profile } = useAuth();
  const { presence, contacts, conversations } = useChatData();
  const [signingOut, setSigningOut] = useState(false);
  const uid = user?.uid ?? '';
  const name = profile?.name ?? user?.displayName ?? 'Người dùng';
  const email = profile?.email ?? user?.email ?? '';
  const online = isOnline(presence[uid]);

  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await logout();
          } catch {
            setSigningOut(false);
            Alert.alert('Không thể đăng xuất', 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const iconProps = { size: 18, color: colors.textSecondary, strokeWidth: 1.9 };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Cài đặt" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Avatar name={name} seed={uid} size={72} online={online} showPresence />
          <Text style={styles.profileName} testID="settings-name">
            {name}
          </Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <View style={[styles.statusPill, online ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: online ? colors.online : colors.disabled }]} />
            <Text style={[styles.statusText, { color: online ? colors.success : colors.textSecondary }]}>
              {online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{conversations.length}</Text>
              <Text style={styles.statLabel}>Cuộc trò chuyện</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{contacts.length}</Text>
              <Text style={styles.statLabel}>Danh bạ</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.card}>
          <InfoRow icon={<User {...iconProps} />} label="Họ tên" value={name} />
          <InfoRow icon={<Mail {...iconProps} />} label="Email" value={email} />
          <InfoRow
            icon={<CalendarDays {...iconProps} />}
            label="Ngày tham gia"
            value={profile?.createdAt ? formatDate(profile.createdAt) : '—'}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Ứng dụng</Text>
        <View style={styles.card}>
          <InfoRow icon={<ShieldCheck {...iconProps} />} label="Bảo mật" value="Firebase Authentication" />
          <InfoRow icon={<Info {...iconProps} />} label="Phiên bản" value="1.0.0" last />
        </View>

        <Button
          testID="logout-button"
          title="Đăng xuất"
          variant="danger"
          icon={<LogOut size={18} color={colors.danger} strokeWidth={2} />}
          onPress={confirmLogout}
          loading={signingOut}
          style={styles.logout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  profileEmail: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  statusOnline: {
    backgroundColor: colors.successSoft,
  },
  statusOffline: {
    backgroundColor: colors.divider,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  infoIcon: {
    width: 28,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
  },
  infoValue: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  logout: {
    marginTop: spacing.xxl,
  },
});
