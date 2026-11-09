import React, { memo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

import colors from '../../theme/colors';
import typography, { spacing } from '../../theme/typography';
import { Message } from '../../types/models';
import { buildMapUrl, formatCoordinates } from '../../utils/chat';
import { formatClock } from '../../utils/time';
import LocationPreview from './LocationPreview';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

const LOCATION_WIDTH = 236;

function MessageBubble({ message, isMine, isFirstInGroup, isLastInGroup }: MessageBubbleProps) {
  const corner = {
    borderTopLeftRadius: !isMine && !isFirstInGroup ? 6 : 18,
    borderBottomLeftRadius: !isMine && !isLastInGroup ? 6 : 18,
    borderTopRightRadius: isMine && !isFirstInGroup ? 6 : 18,
    borderBottomRightRadius: isMine && !isLastInGroup ? 6 : 18,
  };
  const time = formatClock(message.createdAt);

  if (message.type === 'location' && message.location) {
    const point = message.location;
    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs, isLastInGroup && styles.rowGap]}>
        <Pressable
          testID="location-message"
          onPress={() => Linking.openURL(buildMapUrl(point)).catch(() => undefined)}
          accessibilityRole="link"
          accessibilityLabel="Mở vị trí trên bản đồ"
          style={({ pressed }) => [
            styles.locationCard,
            corner,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
            pressed && styles.pressed,
          ]}
        >
          <LocationPreview width={LOCATION_WIDTH} height={118} tint={isMine ? 'dark' : 'light'} />
          <View style={styles.locationBody}>
            <Text style={[styles.locationTitle, isMine && styles.textMine]}>Vị trí hiện tại</Text>
            <Text style={[styles.locationCoords, isMine ? styles.mutedMine : styles.mutedTheirs]}>
              {formatCoordinates(point)}
              {point.accuracy ? `  ·  ±${point.accuracy} m` : ''}
            </Text>
            <View style={styles.locationFooter}>
              <View style={styles.openRow}>
                <ExternalLink size={13} color={isMine ? colors.onPrimary : colors.primary} strokeWidth={2.2} />
                <Text style={[styles.openText, { color: isMine ? colors.onPrimary : colors.primary }]}>Mở bản đồ</Text>
              </View>
              <Text style={[styles.time, isMine ? styles.mutedMine : styles.mutedTheirs]}>{time}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs, isLastInGroup && styles.rowGap]}>
      <View
        testID={isMine ? 'message-mine' : 'message-theirs'}
        style={[styles.bubble, corner, isMine ? styles.bubbleMine : styles.bubbleTheirs]}
      >
        <Text style={[styles.text, isMine && styles.textMine]}>
          {message.text}
          <Text style={[styles.timeSpacer, isMine ? styles.spacerMine : styles.spacerTheirs]}>
            {'  '}
            {time}
          </Text>
        </Text>
        <Text style={[styles.timeFloating, isMine ? styles.mutedMine : styles.mutedTheirs]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: 2,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  rowGap: {
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 7,
  },
  bubbleMine: {
    backgroundColor: colors.bubbleOutgoing,
  },
  bubbleTheirs: {
    backgroundColor: colors.bubbleIncoming,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  text: {
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  textMine: {
    color: colors.onPrimary,
  },
  timeSpacer: {
    fontSize: 11,
    fontWeight: '500',
  },
  spacerMine: {
    color: colors.bubbleOutgoing,
  },
  spacerTheirs: {
    color: colors.bubbleIncoming,
  },
  timeFloating: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 11,
    fontWeight: '500',
  },
  mutedMine: {
    color: colors.onPrimaryMuted,
  },
  mutedTheirs: {
    color: colors.textMuted,
  },
  locationCard: {
    width: LOCATION_WIDTH,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
  },
  locationBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  locationTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  locationCoords: {
    ...typography.caption,
    marginTop: 2,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openText: {
    ...typography.smallStrong,
    marginLeft: 5,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default memo(MessageBubble);
