import React from 'react';
import { Pressable, Text } from 'react-native';
import { useStyles } from '../theme';
import { openWhatsApp } from '../lib/whatsapp';

const styles = (t) => ({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: t.wa,
    elevation: 6,
  },
  text: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});

// Floating WhatsApp button, like the one on every page of the website.
export default function WhatsAppFab({ message }) {
  const { s } = useStyles(styles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Chat on WhatsApp" onPress={() => openWhatsApp(message)} style={s.fab}>
      <Text style={s.text}>WhatsApp</Text>
    </Pressable>
  );
}
