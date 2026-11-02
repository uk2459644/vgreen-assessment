import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '../theme';
import { Field, controlStyles } from './Field';

const styles = (t) => ({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '70%',
    backgroundColor: t.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: t.text, paddingHorizontal: 20, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  optionOn: { backgroundColor: t.greenSoft },
  optionText: { flex: 1, fontSize: 16, color: t.text },
  tick: { fontSize: 18, fontWeight: '800', color: t.green, marginLeft: 12 },
  chevron: { fontSize: 14, color: t.muted },
});

// A dropdown that opens a bottom sheet. Pure JavaScript, so no native picker library is needed.
// options: [{ value, label }]. An option with value '' acts as "no selection".
export default function Select({
  label,
  required,
  error,
  hint,
  value,
  options,
  placeholder = 'Select',
  title,
  onChange,
  onLayout,
  style,
}) {
  const [open, setOpen] = useState(false);
  const { s } = useStyles(styles);
  const { s: c } = useStyles(controlStyles);
  const insets = useSafeAreaInsets();

  const selected = options.find((o) => o.value === value);

  return (
    <Field label={label} required={required} error={error} hint={hint} onLayout={onLayout} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label || title || 'Select'}: ${selected ? selected.label : placeholder}`}
        onPress={() => setOpen(true)}
        style={[c.control, error && c.controlError]}
      >
        <Text numberOfLines={1} style={[c.controlText, !selected && c.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={s.chevron}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <Pressable style={s.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
          <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Text style={s.title}>{title || label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => {
                const on = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[s.option, on && s.optionOn]}
                  >
                    <Text style={s.optionText}>{item.label}</Text>
                    {on ? <Text style={s.tick}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </Field>
  );
}
