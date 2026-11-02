import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '../theme';

const styles = (t) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 20 },
  chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: t.border },
  text: { fontSize: 14, color: t.text },
});

// A wrapping row of outlined pills (occasions, customisations).
export default function ChipList({ items }) {
  const { s } = useStyles(styles);
  return (
    <View style={s.row}>
      {items.map((item) => (
        <View key={item} style={s.chip}>
          <Text style={s.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
