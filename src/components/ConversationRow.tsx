import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import colors from '../theme/colors';
import typography, { spacing } from '../theme/typography';
import { Conversation } from '../types/models';
import { formatConversationTime } from '../utils/time';
import Avatar from './Avatar';
import UnreadBadge from './UnreadBadge';

interface ConversationRowProps {
  conversation: Conversation;
  name: string;
  online: boolean;
  isLastFromMe: boolean;
  now: number;
  onPress: (peerId: string) => void;
}

function ConversationRow({ conversation, name, online, isLastFromMe, now, onPress }: ConversationRowProps) {
  const unread = conversation.unread > 0;
  return (
    <Pressable
      testID={`conversation-${conversation.peerId}`}
      onPress={() => onPress(conversation.peerId)}
      android_ripple={{ color: colors.divider }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar name={name} seed={conversation.peerId} size={54} online={online} showPresence />
      <View style={styles.body}>
        <View style={styles.line}>
          <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>
            {formatConversationTime(conversation.updatedAt, now)}
          </Text>
        </View>
        <View style={styles.line}>
          <View style={styles.previewWrap}>
            {conversation.lastType === 'location' ? (
              <MapPin size={14} color={unread ? colors.text : colors.textMuted} strokeWidth={2} style={styles.previewIcon} />
            ) : null}
            <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
              {isLastFromMe ? 'Bạn: ' : ''}
              {conversation.lastMessage}
            </Text>
          </View>
          <UnreadBadge count={conversation.unread} testID={`unread-${conversation.peerId}`} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 22,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  nameUnread: {
    fontWeight: '700',
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timeUnread: {
    color: colors.primary,
    fontWeight: '700',
  },
  previewWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  previewIcon: {
    marginRight: 4,
  },
  preview: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
  previewUnread: {
    color: colors.text,
    fontWeight: '600',
  },
});

export default memo(ConversationRow);
