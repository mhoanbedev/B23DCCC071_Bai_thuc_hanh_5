import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors, { avatarPalette } from '../theme/colors';
import { getInitials, hashString } from '../utils/text';

interface AvatarProps {
  name: string;
  seed: string;
  size?: number;
  online?: boolean;
  showPresence?: boolean;
  ringColor?: string;
}

function Avatar({ name, seed, size = 48, online = false, showPresence = false, ringColor = colors.surface }: AvatarProps) {
  const background = avatarPalette[hashString(seed || name) % avatarPalette.length];
  const dotSize = Math.max(10, Math.round(size * 0.28));
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]} allowFontScaling={false}>
          {getInitials(name)}
        </Text>
      </View>
      {showPresence ? (
        <View
          testID={online ? 'presence-online' : 'presence-offline'}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderColor: ringColor,
              backgroundColor: online ? colors.online : colors.disabled,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.onPrimary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
  },
});

export default memo(Avatar);
