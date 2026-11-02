import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '../theme';

const styles = (t) => ({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: t.greenSoft,
  },
  text: { fontSize: 12, fontWeight: '700', color: t.green },
});

export default function Badge({ children, style }) {
  const { s } = useStyles(styles);
  return (
    <View style={[s.badge, style]}>
      <Text style={s.text}>{children}</Text>
    </View>
  );
}
