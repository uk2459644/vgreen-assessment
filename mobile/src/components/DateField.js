import React from 'react';
import { Platform, Pressable, Text, TextInput } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useStyles } from '../theme';
import { formatDate, parseLocalDate, toLocalISO } from '../lib/format';
import { Field, controlStyles } from './Field';

const styles = (t) => ({
  clear: { fontSize: 16, fontWeight: '700', color: t.muted, paddingLeft: 8 },
});

// Android: opens the system calendar dialog. Other platforms: plain YYYY-MM-DD text box
// (this project targets Android, the fallback just keeps the file safe to import anywhere).
// value and onChange use 'YYYY-MM-DD' strings, or '' for "no date".
export default function DateField({ label, required, error, hint, value, onChange, minimumDate, onLayout, style }) {
  const { t, s } = useStyles(styles);
  const { s: c } = useStyles(controlStyles);

  function open() {
    DateTimePickerAndroid.open({
      value: value ? parseLocalDate(value) : minimumDate || new Date(),
      mode: 'date',
      minimumDate,
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(toLocalISO(date));
      },
    });
  }

  return (
    <Field label={label} required={required} error={error} hint={hint} onLayout={onLayout} style={style}>
      {Platform.OS === 'android' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatDate(value) : 'not set'}`}
          onPress={open}
          style={[c.control, error && c.controlError]}
        >
          <Text numberOfLines={1} style={[c.controlText, !value && c.placeholder]}>
            {value ? formatDate(value) : 'Select a date'}
          </Text>
          {value ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear date" hitSlop={10} onPress={() => onChange('')}>
              <Text style={s.clear}>✕</Text>
            </Pressable>
          ) : null}
        </Pressable>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={t.muted}
          style={[c.control, c.controlText, error && c.controlError]}
        />
      )}
    </Field>
  );
}
