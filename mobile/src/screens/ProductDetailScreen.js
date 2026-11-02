import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { api, ApiError } from '../lib/api';
import { priceRange } from '../lib/format';
import { openWhatsApp } from '../lib/whatsapp';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ChipList from '../components/Chip';
import { ErrorBox, Loading } from '../components/StateViews';

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', aspectRatio: 1, borderRadius: t.radius, backgroundColor: t.surface, marginBottom: 16 },
  name: { fontSize: 26, fontWeight: '800', color: t.text, marginTop: 10, marginBottom: 6 },
  price: { fontSize: 24, fontWeight: '800', color: t.text, marginBottom: 12 },
  per: { fontSize: 14, fontWeight: '400', color: t.muted },
  desc: { fontSize: 16, lineHeight: 24, color: t.text },
  heading: { fontSize: 17, fontWeight: '800', color: t.text, marginTop: 20 },
  actions: { gap: 12, marginTop: 8 },
});

export default function ProductDetailScreen({ navigation, route }) {
  const { s } = useStyles(styles);
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api(`/products/${id}`)
      .then(({ product: p }) => {
        setProduct(p);
        navigation.setOptions({ title: p.name });
      })
      .catch((err) => setError(err instanceof ApiError && err.status === 404 ? 'This product no longer exists.' : err.message))
      .finally(() => setLoading(false));
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <View style={s.screen}><Loading /></View>;

  if (error || !product) {
    return (
      <View style={[s.screen, s.content]}>
        <ErrorBox message={error || 'Something went wrong.'} onRetry={load} />
        <Button title="Back to catalogue" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const waMessage = `Hi Tribe Green, I'm interested in "${product.name}" (${priceRange(product)} per unit). Could you share more details and a quote?`;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Image source={{ uri: product.image }} style={s.image} resizeMode="cover" accessibilityLabel={product.name} />
      <Badge>{product.category}</Badge>
      <Text style={s.name}>{product.name}</Text>
      <Text style={s.price}>
        {priceRange(product)} <Text style={s.per}>per unit</Text>
      </Text>
      <Text style={s.desc}>{product.description}</Text>

      <Text style={s.heading}>Suits these occasions</Text>
      <ChipList items={product.occasions} />

      <Text style={[s.heading, { marginTop: 0 }]}>Customisation available</Text>
      <ChipList items={product.customisations} />

      <View style={s.actions}>
        <Button title="Enquire about this product" onPress={() => navigation.navigate('Enquiry', { productId: product._id })} />
        <Button title="Chat on WhatsApp" variant="whatsapp" onPress={() => openWhatsApp(waMessage)} />
      </View>
    </ScrollView>
  );
}
