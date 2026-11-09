import React, { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const palette: Record<Variant, { background: string; pressed: string; text: string; border: string }> = {
  primary: { background: colors.primary, pressed: colors.primaryDark, text: colors.onPrimary, border: colors.primary },
  secondary: { background: colors.primarySoft, pressed: '#DCE6FA', text: colors.primary, border: colors.primarySoft },
  danger: { background: colors.surface, pressed: colors.dangerSoft, text: colors.danger, border: '#F1C9C9' },
  ghost: { background: 'transparent', pressed: colors.divider, text: colors.primary, border: 'transparent' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  compact = false,
  style,
  testID,
}: ButtonProps) {
  const tone = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        {
          backgroundColor: pressed ? tone.pressed : tone.background,
          borderColor: tone.border,
          opacity: disabled && !loading ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, { color: tone.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regular: {
    height: 50,
    paddingHorizontal: spacing.xl,
  },
  compact: {
    height: 40,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
  },
});
