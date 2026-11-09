const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  'auth/invalid-login-credentials': 'Email hoặc mật khẩu không đúng',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hoá',
  'auth/email-already-in-use': 'Email này đã được đăng ký',
  'auth/weak-password': 'Mật khẩu tối thiểu 6 ký tự',
  'auth/too-many-requests': 'Bạn thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại',
  'auth/network-request-failed': 'Không có kết nối mạng. Kiểm tra mạng rồi thử lại',
  'auth/operation-not-allowed': 'Phương thức đăng nhập Email/Password chưa được bật trên Firebase',
};

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return AUTH_ERROR_MESSAGES[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại';
}
