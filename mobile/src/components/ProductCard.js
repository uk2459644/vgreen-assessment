import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { priceRange } from '../lib/format';
import Badge from './Badge';

const styles = (t) => ({
  card: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius,
    overflow: 'hidden',
    backgroundColor: t.bg,
  },
  pressed: { opacity: 0.85 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: t.surface },
  body: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: t.text, marginTop: 8, marginBottom: 2 },
  price: { fontSize: 14, fontWeight: '700', color: t.text },
  per: { fontWeight: '400', color: t.muted },
  desc: { fontSize: 12, color: t.muted, marginTop: 4 },
});

export default function ProductCard({ product, onPress }) {
  const { s } = useStyles(styles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${priceRange(product)} per unit`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.pressed]}
    >
      <Image source={{ uri: product.image }} style={s.image} resizeMode="cover" accessibilityIgnoresInvertColors />
      <View style={s.body}>
        <Badge>{product.category}</Badge>
        <Text style={s.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={s.price}>
          {priceRange(product)} <Text style={s.per}>per unit</Text>
        </Text>
        <Text style={s.desc} numberOfLines={2}>
          {product.description}
        </Text>
      </View>
    </Pressable>
  );
}
