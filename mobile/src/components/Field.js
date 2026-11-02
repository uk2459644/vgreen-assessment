import React, { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useStyles } from '../theme';

// Shared look for the select and date boxes (same as the website's inputs).
export const controlStyles = (t) => ({
  control: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 10,
    backgroundColor: t.bg,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlError: { borderColor: t.danger },
  controlText: { flex: 1, fontSize: 16, color: t.text },
  placeholder: { color: t.muted },
});

const styles = (t) => ({
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: t.text, marginBottom: 6 },
  req: { color: t.danger },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 10,
    backgroundColor: t.bg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: t.text,
  },
  multiline: { minHeight: 110, paddingTop: 12 },
  inputError: { borderColor: t.danger },
  hint: { marginTop: 4, fontSize: 12, color: t.muted },
  error: { marginTop: 4, fontSize: 12, color: t.danger },
});

// Label + control + hint or error message. `onLayout` lets the form scroll to a field with an error.
export function Field({ label, required, error, hint, children, onLayout, style }) {
  const { s } = useStyles(styles);
  return (
    <View style={[s.field, style]} onLayout={onLayout}>
      {label ? (
        <Text style={s.label}>
          {label}
          {required ? <Text style={s.req}> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text style={s.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={s.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export const TextField = forwardRef(function TextField(
  { label, required, error, hint, onLayout, style, multiline, ...inputProps },
  ref
) {
  const { t, s } = useStyles(styles);
  return (
    <Field label={label} required={required} error={error} hint={hint} onLayout={onLayout} style={style}>
      <TextInput
        ref={ref}
        placeholderTextColor={t.muted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[s.input, multiline && s.multiline, error && s.inputError]}
        {...inputProps}
      />
    </Field>
  );
});
