import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useStyles } from '../theme';
import { api } from '../lib/api';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import Select from '../components/Select';
import WhatsAppFab from '../components/WhatsAppFab';
import { EmptyState, ErrorBox, Loading } from '../components/StateViews';

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.bg },
  hero: { backgroundColor: t.greenDark, paddingVertical: 28, paddingHorizontal: 16, overflow: 'hidden' },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1f7a4d',
    opacity: 0.55,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#ffffff', lineHeight: 32, marginBottom: 8 },
  heroText: { fontSize: 15, color: '#ffffff', opacity: 0.92, lineHeight: 22 },
  filters: { paddingHorizontal: 16, paddingTop: 20 },
  searchInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 10,
    backgroundColor: t.bg,
    paddingHorizontal: 12,
    fontSize: 16,
    color: t.text,
  },
  label: { fontSize: 14, fontWeight: '700', color: t.text, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  half: { flex: 1 },
  halfSelect: { flex: 1, marginBottom: 0 },
  clearWrap: { flex: 1, justifyContent: 'flex-end' },
  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  count: { fontSize: 14, color: t.muted },
  errorWrap: { paddingHorizontal: 16 },
  cell: { padding: 6 },
  rowWrap: { paddingHorizontal: 10 },
  listBottom: { paddingBottom: 96 },
});

const FIRST = (label) => (list) => [{ value: '', label }, ...list.map((v) => ({ value: v, label: v }))];
const categoryOptions = FIRST('All categories');
const occasionOptions = FIRST('All occasions');

export default function CatalogueScreen({ navigation }) {
  const { t, s } = useStyles(styles);
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;

  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ category: '', occasion: '', budget: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Wait 400 ms after typing stops before searching.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Filter lists (categories, occasions, budget bands) come from the backend.
  useEffect(() => {
    let cancelled = false;
    api('/meta')
      .then((m) => !cancelled && setMeta(m))
      .catch(() => {
        // the products request below shows the error message
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Reload products whenever a filter, the search text, or the retry counter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api('/products', { params: { ...filters, search } })
      .then((r) => {
        if (!cancelled) setProducts(r.products);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filters, search, reloadKey]);

  const setFilter = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));
  const hasFilters = Boolean(filters.category || filters.occasion || filters.budget || search || searchInput);

  function clearFilters() {
    setFilters({ category: '', occasion: '', budget: '' });
    setSearchInput('');
    setSearch('');
  }

  const budgetOptions = [{ value: '', label: 'Any budget' }, ...(meta ? meta.budgetBands.map((b) => ({ value: b.key, label: b.label })) : [])];

  const header = (
    <View>
      <View style={s.hero}>
        <View style={s.heroGlow} />
        <Text style={s.heroTitle}>Corporate gifts your people will actually use</Text>
        <Text style={s.heroText}>
          Welcome kits, festive gifts, client gifts and branded merchandise. Pick products, tell us your occasion and budget,
          and we will send you a quote.
        </Text>
      </View>

      <View style={s.filters}>
        <Text style={s.label}>Search</Text>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="e.g. bottle, hamper"
          placeholderTextColor={t.muted}
          returnKeyType="search"
          autoCorrect={false}
          style={s.searchInput}
        />
        <View style={s.row}>
          <Select
            label="Category"
            value={filters.category}
            options={categoryOptions(meta ? meta.categories : [])}
            placeholder="All categories"
            onChange={setFilter('category')}
            style={s.halfSelect}
          />
          <Select
            label="Occasion"
            value={filters.occasion}
            options={occasionOptions(meta ? meta.occasions : [])}
            placeholder="All occasions"
            onChange={setFilter('occasion')}
            style={s.halfSelect}
          />
        </View>
        <View style={s.row}>
          <Select
            label="Budget per unit"
            value={filters.budget}
            options={budgetOptions}
            placeholder="Any budget"
            onChange={setFilter('budget')}
            style={s.halfSelect}
          />
          <View style={s.clearWrap}>
            {hasFilters ? <Button title="Clear filters" variant="outline" small onPress={clearFilters} /> : null}
          </View>
        </View>
      </View>

      {error ? (
        <View style={[s.errorWrap, { marginTop: 16 }]}>
          <ErrorBox message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        </View>
      ) : (
        <View style={s.resultBar}>
          <Text style={s.count}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </Text>
          {loading ? <ActivityIndicator size="small" color={t.green} /> : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={s.screen}>
      <FlatList
        key={columns}
        data={products}
        numColumns={columns}
        keyExtractor={(p) => p._id}
        columnWrapperStyle={s.rowWrap}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.listBottom}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[t.green]}
            onRefresh={() => {
              setRefreshing(true);
              setReloadKey((k) => k + 1);
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={[s.cell, { width: `${100 / columns}%` }]}>
            <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item._id })} />
          </View>
        )}
        ListEmptyComponent={
          loading && !error ? (
            <Loading />
          ) : error ? null : (
            <EmptyState
              title="No products match these filters"
              text="Try a different category, occasion or budget."
              actionTitle="Clear filters"
              onAction={clearFilters}
            />
          )
        }
      />
      <WhatsAppFab message="Hi Tribe Green, I'd like to know more about corporate gifting options." />
    </View>
  );
}
