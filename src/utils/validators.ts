export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterInput, string>>;

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginInput, string>>;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function validateRegister(input: RegisterInput): RegisterErrors {
  const errors: RegisterErrors = {};
  const name = input.name.trim();
  if (!name) {
    errors.name = 'Vui lòng nhập họ tên';
  } else if (name.length < 2) {
    errors.name = 'Họ tên quá ngắn';
  } else if (name.length > 60) {
    errors.name = 'Họ tên tối đa 60 ký tự';
  }
  if (!input.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (!input.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
  }
  if (!input.confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }
  return errors;
}

export function validateLogin(input: LoginInput): LoginErrors {
  const errors: LoginErrors = {};
  if (!input.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (!input.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  }
  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}
