import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';

interface UnreadBadgeProps {
  count: number;
  testID?: string;
}

export default function UnreadBadge({ count, testID }: UnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }
  return (
    <View style={styles.badge} testID={testID}>
      <Text style={styles.text} allowFontScaling={false}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
