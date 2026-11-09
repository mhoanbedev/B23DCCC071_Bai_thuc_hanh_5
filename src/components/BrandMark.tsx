import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MessagesSquare } from 'lucide-react-native';

import colors from '../theme/colors';
import typography, { spacing } from '../theme/typography';

export default function BrandMark() {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <MessagesSquare size={22} color={colors.onPrimary} strokeWidth={2} />
      </View>
      <Text style={styles.name}>Nhắn Tin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginLeft: spacing.md,
  },
});
