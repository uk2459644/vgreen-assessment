import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useStyles } from '../theme';

const styles = (t) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 2,
  },
  small: { paddingVertical: 6, paddingHorizontal: 14 },
  solid: { backgroundColor: t.green, borderColor: t.green },
  whatsapp: { backgroundColor: t.wa, borderColor: t.wa },
  outline: { backgroundColor: 'transparent', borderColor: t.green },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  text: { fontWeight: '700', fontSize: 16, color: '#ffffff' },
  textSmall: { fontSize: 14 },
  textOutline: { color: t.green },
});

// variant: 'solid' (green) | 'outline' | 'whatsapp'
export default function Button({ title, onPress, variant = 'solid', small = false, disabled = false, loading = false, style }) {
  const { t, s } = useStyles(styles);
  const off = disabled || loading;
  const outline = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [s.base, small && s.small, s[variant], off && s.disabled, pressed && s.pressed, style]}
    >
      {loading ? <ActivityIndicator size="small" color={outline ? t.green : '#ffffff'} /> : null}
      <Text style={[s.text, small && s.textSmall, outline && s.textOutline]}>{title}</Text>
    </Pressable>
  );
}
