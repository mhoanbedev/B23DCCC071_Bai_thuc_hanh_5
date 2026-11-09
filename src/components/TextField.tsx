import React, { ComponentRef, forwardRef, ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: ReactNode;
  secure?: boolean;
}

export type TextFieldHandle = ComponentRef<typeof TextInput>;

const TextField = forwardRef<TextFieldHandle, TextFieldProps>(({ label, error, icon, secure = false, style, ...inputProps }, ref) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, { borderColor }, focused && styles.fieldFocused]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          ref={ref}
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && hidden}
          onFocus={event => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden(value => !value)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
          >
            {hidden ? (
              <Eye size={20} color={colors.textMuted} strokeWidth={1.8} />
            ) : (
              <EyeOff size={20} color={colors.textMuted} strokeWidth={1.8} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.smallStrong,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  fieldFocused: {
    backgroundColor: '#FBFCFF',
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 6,
  },
});

export default TextField;
