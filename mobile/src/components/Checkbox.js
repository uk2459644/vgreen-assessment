import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStyles } from '../theme';

const styles = (t) => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  box: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.bg,
  },
  boxOn: { backgroundColor: t.green, borderColor: t.green },
  tick: { color: '#ffffff', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  label: { flex: 1, fontSize: 15, color: t.text },
  sub: { color: t.muted },
});

export default function Checkbox({ label, sub, checked, onPress }) {
  const { s } = useStyles(styles);
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={s.row}>
      <View style={[s.box, checked && s.boxOn]}>{checked ? <Text style={s.tick}>✓</Text> : null}</View>
      <Text style={s.label}>
        {label}
        {sub ? <Text style={s.sub}> ({sub})</Text> : null}
      </Text>
    </Pressable>
  );
}
