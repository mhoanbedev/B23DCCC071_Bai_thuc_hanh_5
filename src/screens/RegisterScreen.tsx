import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, ChevronLeft, Lock, Mail, User } from 'lucide-react-native';

import Button from '../components/Button';
import TextField, { TextFieldHandle } from '../components/TextField';
import { RootStackParamList } from '../navigation/types';
import { getAuthErrorMessage } from '../services/authErrors';
import { register } from '../services/authService';
import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';
import { hasErrors, MIN_PASSWORD_LENGTH, RegisterErrors, RegisterInput, validateRegister } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const EMPTY_FORM: RegisterInput = { name: '', email: '', password: '', confirmPassword: '' };

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState<RegisterInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextFieldHandle>(null);
  const passwordRef = useRef<TextFieldHandle>(null);
  const confirmRef = useRef<TextFieldHandle>(null);

  const updateField = (field: keyof RegisterInput) => (value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setFormError('');
    if (errors[field]) {
      setErrors(current => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    setFormError('');
    if (hasErrors(nextErrors)) {
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          testID="register-back"
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityLabel="Quay lại"
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để bắt đầu nhắn tin với bạn bè của bạn.</Text>

          {formError ? (
            <View style={styles.alert} testID="register-error">
              <AlertCircle size={18} color={colors.danger} strokeWidth={2} />
              <Text style={styles.alertText}>{formError}</Text>
            </View>
          ) : null}

          <TextField
            testID="register-name"
            label="Họ và tên"
            icon={<User size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={form.name}
            onChangeText={updateField('name')}
            placeholder="Nguyễn Văn A"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={errors.name}
          />
          <TextField
            ref={emailRef}
            testID="register-email"
            label="Email"
            icon={<Mail size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={form.email}
            onChangeText={updateField('email')}
            placeholder="ten@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={errors.email}
          />
          <TextField
            ref={passwordRef}
            testID="register-password"
            label="Mật khẩu"
            icon={<Lock size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={form.password}
            onChangeText={updateField('password')}
            placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
            secure
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
          />
          <TextField
            ref={confirmRef}
            testID="register-confirm"
            label="Nhập lại mật khẩu"
            icon={<Lock size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={form.confirmPassword}
            onChangeText={updateField('confirmPassword')}
            placeholder="Nhập lại mật khẩu"
            secure
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={errors.confirmPassword}
          />

          <Button testID="register-submit" title="Đăng ký" onPress={handleSubmit} loading={submitting} style={styles.submit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.link}>Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: colors.divider,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  alertText: {
    ...typography.smallStrong,
    color: colors.danger,
    marginLeft: spacing.sm,
    flex: 1,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: 6,
  },
  link: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
