import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MapPin, SendHorizontal } from 'lucide-react-native';

import colors from '../../theme/colors';
import typography, { spacing } from '../../theme/typography';
import { canSendText, MAX_MESSAGE_LENGTH } from '../../utils/chat';

interface ComposerProps {
  onSendText: (text: string) => Promise<void>;
  onSendLocation: () => Promise<void>;
  bottomInset: number;
}

export default function Composer({ onSendText, onSendLocation, bottomInset }: ComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [locating, setLocating] = useState(false);
  const sendable = canSendText(text) && !sending;

  const handleSend = async () => {
    if (!canSendText(text) || sending) {
      return;
    }
    const value = text;
    setSending(true);
    setText('');
    try {
      await onSendText(value);
    } catch {
      setText(value);
    } finally {
      setSending(false);
    }
  };

  const handleLocation = async () => {
    if (locating) {
      return;
    }
    setLocating(true);
    try {
      await onSendLocation();
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, spacing.sm) + spacing.sm }]}>
      <Pressable
        testID="send-location-button"
        onPress={handleLocation}
        disabled={locating}
        hitSlop={6}
        accessibilityLabel="Gửi vị trí hiện tại"
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <MapPin size={22} color={colors.primary} strokeWidth={2} />
        )}
      </Pressable>
      <View style={styles.inputWrap}>
        <TextInput
          testID="message-input"
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
        />
      </View>
      <Pressable
        testID="send-button"
        onPress={handleSend}
        disabled={!sendable}
        accessibilityLabel="Gửi tin nhắn"
        accessibilityState={{ disabled: !sendable }}
        style={({ pressed }) => [
          styles.sendButton,
          { backgroundColor: sendable ? (pressed ? colors.primaryDark : colors.primary) : colors.divider },
        ]}
      >
        <SendHorizontal size={20} color={sendable ? colors.onPrimary : colors.disabled} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    backgroundColor: colors.primarySoft,
  },
  inputWrap: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 21,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 118,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});
