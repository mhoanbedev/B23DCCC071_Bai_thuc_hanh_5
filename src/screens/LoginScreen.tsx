import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, Lock, Mail } from 'lucide-react-native';

import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import TextField, { TextFieldHandle } from '../components/TextField';
import { RootStackParamList } from '../navigation/types';
import { getAuthErrorMessage } from '../services/authErrors';
import { login } from '../services/authService';
import colors from '../theme/colors';
import typography, { radius, spacing } from '../theme/typography';
import { hasErrors, LoginErrors, validateLogin } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextFieldHandle>(null);

  const handleSubmit = async () => {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    setFormError('');
    if (hasErrors(nextErrors)) {
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandMark />
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn quay lại. Đăng nhập để tiếp tục trò chuyện.</Text>

          {formError ? (
            <View style={styles.alert} testID="login-error">
              <AlertCircle size={18} color={colors.danger} strokeWidth={2} />
              <Text style={styles.alertText}>{formError}</Text>
            </View>
          ) : null}

          <TextField
            testID="login-email"
            label="Email"
            icon={<Mail size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={email}
            onChangeText={value => {
              setEmail(value);
              setFormError('');
            }}
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
            testID="login-password"
            label="Mật khẩu"
            icon={<Lock size={18} color={colors.textMuted} strokeWidth={1.8} />}
            value={password}
            onChangeText={value => {
              setPassword(value);
              setFormError('');
            }}
            placeholder="Nhập mật khẩu"
            secure
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={errors.password}
          />

          <Button testID="login-submit" title="Đăng nhập" onPress={handleSubmit} loading={submitting} style={styles.submit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <Pressable testID="go-register" onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <Text style={styles.link}>Đăng ký ngay</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 56,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.xxxl,
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
