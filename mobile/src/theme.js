import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// Same palette as the website (web/app/globals.css), including its dark mode.
const shared = { greenDark: '#0b3d2e', wa: '#25a244', radius: 14 };

export const lightTheme = {
  ...shared,
  dark: false,
  green: '#1f7a4d',
  greenSoft: '#e7f4ec',
  bg: '#ffffff',
  surface: '#f6f8f7',
  text: '#16221c',
  muted: '#5b6b63',
  border: '#dfe6e2',
  danger: '#c0392b',
};

export const darkTheme = {
  ...shared,
  dark: true,
  green: '#3fae78',
  greenSoft: '#173326',
  bg: '#0f1713',
  surface: '#16211b',
  text: '#e8f0ec',
  muted: '#9bb0a5',
  border: '#26352d',
  danger: '#ff7a6b',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

// Usage: define `const styles = (t) => ({ ... })` at module level, then
// `const { t, s } = useStyles(styles)` inside the component.
// Styles are rebuilt only when the light/dark theme changes.
export function useStyles(factory) {
  const t = useTheme();
  const s = useMemo(() => StyleSheet.create(factory(t)), [factory, t]);
  return { t, s };
}
