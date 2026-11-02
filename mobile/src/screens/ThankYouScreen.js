import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { openWhatsApp } from '../lib/whatsapp';
import Button from '../components/Button';

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  tick: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: t.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tickText: { fontSize: 36, fontWeight: '800', color: t.green },
  title: { fontSize: 26, fontWeight: '800', color: t.text, textAlign: 'center', marginBottom: 8 },
  text: { fontSize: 16, color: t.muted, textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  ref: { fontSize: 16, color: t.text, marginBottom: 24 },
  actions: { alignSelf: 'stretch', gap: 12 },
});

export default function ThankYouScreen({ navigation, route }) {
  const { s } = useStyles(styles);
  const id = route.params && route.params.ref;
  const shortRef = id && /^[a-f\d]{24}$/i.test(id) ? id.slice(-6).toUpperCase() : '';

  const goTo = (screen) =>
    navigation.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen } }] });

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={s.tick}>
        <Text style={s.tickText}>✓</Text>
      </View>
      <Text style={s.title}>Thank you, we have your enquiry</Text>
      <Text style={s.text}>The Tribe Green team will get back to you shortly on the phone or email you shared.</Text>
      {shortRef ? (
        <Text style={s.ref}>
          Reference: <Text style={{ fontWeight: '800' }}>{shortRef}</Text>
        </Text>
      ) : null}

      <View style={s.actions}>
        <Button title="Back to catalogue" onPress={() => goTo('Catalogue')} />
        <Button title="View my enquiries" variant="outline" onPress={() => goTo('MyEnquiries')} />
        <Button
          title="Message us on WhatsApp"
          variant="whatsapp"
          onPress={() =>
            openWhatsApp(`Hi Tribe Green, I just sent an enquiry${shortRef ? ` (ref ${shortRef})` : ''}. Please confirm you received it.`)
          }
        />
      </View>
    </ScrollView>
  );
}
