import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStyles } from '../theme';
import { getMyEnquiries } from '../lib/storage';
import { formatDateTime } from '../lib/format';
import { EmptyState } from '../components/StateViews';

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.bg },
  list: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  note: { fontSize: 13, color: t.muted, marginBottom: 14 },
  card: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius,
    padding: 14,
    marginBottom: 12,
    backgroundColor: t.bg,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  ref: { fontSize: 13, fontWeight: '800', color: t.green },
  pill: { paddingVertical: 2, paddingHorizontal: 10, borderRadius: 999, backgroundColor: t.greenSoft },
  pillText: { fontSize: 12, fontWeight: '700', color: t.green },
  occasion: { fontSize: 17, fontWeight: '800', color: t.text },
  line: { fontSize: 14, color: t.text, marginTop: 4 },
  muted: { fontSize: 13, color: t.muted, marginTop: 6 },
});

// Enquiries sent from this phone, read from AsyncStorage each time the tab is focused.
export default function MyEnquiriesScreen({ navigation }) {
  const { s } = useStyles(styles);
  const [items, setItems] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getMyEnquiries().then((list) => {
        if (active) setItems(list);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={s.screen}>
      <FlatList
        data={items || []}
        keyExtractor={(e) => e.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={items && items.length ? <Text style={s.note}>Saved on this phone. The team will contact you by phone or email.</Text> : null}
        ListEmptyComponent={
          items ? (
            <EmptyState
              title="No enquiries yet"
              text="Enquiries you send from this app will appear here."
              actionTitle="Browse catalogue"
              onAction={() => navigation.navigate('Catalogue')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.top}>
              <Text style={s.ref}>#{String(item.id).slice(-6).toUpperCase()}</Text>
              <View style={s.pill}>
                <Text style={s.pillText}>Sent</Text>
              </View>
            </View>
            <Text style={s.occasion}>{item.occasion}</Text>
            <Text style={s.line}>
              {item.units} {item.units === 1 ? 'unit' : 'units'} · {item.company}
            </Text>
            <Text style={s.line}>
              {item.products && item.products.length ? item.products.map((p) => p.name).join(', ') : 'No specific products selected'}
            </Text>
            <Text style={s.muted}>{formatDateTime(item.createdAt)}</Text>
          </View>
        )}
      />
    </View>
  );
}
