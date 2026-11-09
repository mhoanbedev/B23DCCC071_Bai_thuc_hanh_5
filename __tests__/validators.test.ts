import { getAuthErrorMessage } from '../src/services/authErrors';
import { hasErrors, validateLogin, validateRegister } from '../src/utils/validators';

describe('register validation', () => {
  const valid = { name: 'Vũ Minh Hoàn', email: 'hoan@test.dev', password: 'secret1', confirmPassword: 'secret1' };

  test('accepts a valid form', () => {
    expect(hasErrors(validateRegister(valid))).toBe(false);
  });

  test('requires every field', () => {
    const errors = validateRegister({ name: ' ', email: '', password: '', confirmPassword: '' });
    expect(errors).toEqual({
      name: 'Vui lòng nhập họ tên',
      email: 'Vui lòng nhập email',
      password: 'Vui lòng nhập mật khẩu',
      confirmPassword: 'Vui lòng nhập lại mật khẩu',
    });
  });

  test('enforces minimum password length of 6', () => {
    expect(validateRegister({ ...valid, password: '12345', confirmPassword: '12345' }).password).toBe(
      'Mật khẩu tối thiểu 6 ký tự',
    );
    expect(validateRegister({ ...valid, password: '123456', confirmPassword: '123456' }).password).toBeUndefined();
  });

  test('confirm password must match', () => {
    expect(validateRegister({ ...valid, confirmPassword: 'secret2' }).confirmPassword).toBe('Mật khẩu nhập lại không khớp');
  });

  test('rejects malformed email', () => {
    expect(validateRegister({ ...valid, email: 'hoan@test' }).email).toBe('Email không hợp lệ');
  });
});

describe('login validation and auth errors', () => {
  test('login requires email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Vui lòng nhập email',
      password: 'Vui lòng nhập mật khẩu',
    });
  });

  test('wrong credentials map to a friendly message', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe('Email hoặc mật khẩu không đúng');
    expect(getAuthErrorMessage({ code: 'auth/wrong-password' })).toBe('Email hoặc mật khẩu không đúng');
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe('Email này đã được đăng ký');
    expect(getAuthErrorMessage(new Error('boom'))).toBe('Đã có lỗi xảy ra. Vui lòng thử lại');
  });
});
