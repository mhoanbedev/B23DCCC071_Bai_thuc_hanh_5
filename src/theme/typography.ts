import { TextStyle } from 'react-native';

const typography = {
  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  small: { fontSize: 13, fontWeight: '400' },
  smallStrong: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  tiny: { fontSize: 11, fontWeight: '500' },
} satisfies Record<string, TextStyle>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export default typography;
