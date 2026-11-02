import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useStyles } from '../theme';
import Button from './Button';

const styles = (t) => ({
  alert: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.danger,
    marginBottom: 16,
  },
  alertText: { color: t.danger, fontSize: 14 },
  retry: { marginTop: 10, alignSelf: 'flex-start' },
  empty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: t.border,
    borderRadius: t.radius,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: t.text, textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 14, color: t.muted, textAlign: 'center', marginBottom: 16 },
  loading: { paddingVertical: 48, alignItems: 'center' },
});

// Red outlined message, optionally with a retry button (same look as the website's .alert).
export function ErrorBox({ message, onRetry }) {
  const { s } = useStyles(styles);
  return (
    <View style={s.alert} accessibilityRole="alert">
      <Text style={s.alertText}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="outline" small onPress={onRetry} style={s.retry} /> : null}
    </View>
  );
}

// Dashed box for "nothing here" (same look as the website's .empty).
export function EmptyState({ title, text, actionTitle, onAction }) {
  const { s } = useStyles(styles);
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
      {actionTitle ? <Button title={actionTitle} variant="outline" onPress={onAction} /> : null}
    </View>
  );
}

export function Loading() {
  const { t, s } = useStyles(styles);
  return (
    <View style={s.loading}>
      <ActivityIndicator size="large" color={t.green} />
    </View>
  );
}
