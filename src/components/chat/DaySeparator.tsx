import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';
import typography, { spacing } from '../../theme/typography';

export default function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(24, 32, 43, 0.07)',
  },
  text: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
