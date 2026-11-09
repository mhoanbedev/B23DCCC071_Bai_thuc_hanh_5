import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Tìm kiếm' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.textMuted} strokeWidth={2} />
      <TextInput
        testID="search-input"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityLabel="Xoá nội dung tìm kiếm"
          style={styles.clear}
        >
          <X size={14} color={colors.surface} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
