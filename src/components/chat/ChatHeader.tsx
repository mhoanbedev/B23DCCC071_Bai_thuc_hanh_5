import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import colors from '../../theme/colors';
import typography, { spacing } from '../../theme/typography';
import Avatar from '../Avatar';

interface ChatHeaderProps {
  name: string;
  peerId: string;
  online: boolean;
  statusLabel: string;
  topInset: number;
  onBack: () => void;
}

export default function ChatHeader({ name, peerId, online, statusLabel, topInset, onBack }: ChatHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: topInset + spacing.sm }]}>
      <Pressable
        testID="chat-back"
        onPress={onBack}
        hitSlop={8}
        accessibilityLabel="Quay lại"
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
      >
        <ChevronLeft size={26} color={colors.text} strokeWidth={2} />
      </Pressable>
      <Avatar name={name} seed={peerId} size={40} online={online} showPresence />
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1} testID="chat-title">
          {name}
        </Text>
        <Text style={[styles.status, online && styles.statusOnline]} numberOfLines={1} testID="chat-status">
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  backPressed: {
    backgroundColor: colors.divider,
  },
  texts: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  status: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusOnline: {
    color: colors.online,
  },
});
