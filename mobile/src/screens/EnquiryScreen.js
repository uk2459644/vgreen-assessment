import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { api, ApiError } from '../lib/api';
import { saveMyEnquiry } from '../lib/storage';
import { localToday, validate } from '../lib/validation';
import { parseLocalDate } from '../lib/format';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import DateField from '../components/DateField';
import { TextField } from '../components/Field';
import Select from '../components/Select';
import { ErrorBox, Loading } from '../components/StateViews';

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: t.text, marginBottom: 4 },
  sub: { fontSize: 14, color: t.muted, marginBottom: 20 },
  box: { borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, marginBottom: 16 },
  legend: { fontSize: 14, fontWeight: '700', color: t.text },
  boxError: { fontSize: 12, color: t.danger, marginBottom: 12, marginTop: -8 },
  alert: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: t.danger, marginBottom: 16 },
  alertText: { color: t.danger, fontSize: 14 },
});

const EMPTY = {
  name: '',
  company: '',
  phone: '',
  email: '',
  occasion: '',
  units: '',
  budgetPerUnit: '',
  deliveryDate: '',
  message: '',
};

// Order the fields appear on screen, used to scroll to the first one with an error.
const FIELD_ORDER = ['name', 'company', 'phone', 'email', 'occasion', 'units', 'budgetPerUnit', 'deliveryDate', 'products', 'customisation', 'message'];

export default function EnquiryScreen({ navigation, route }) {
  const { s } = useStyles(styles);
  const productId = route.params && route.params.productId;

  const [meta, setMeta] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [values, setValues] = useState(EMPTY);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customisation, setCustomisation] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scrollRef = useRef(null);
  const formY = useRef(0);
  const positions = useRef({});
  const inputs = useRef({});

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    Promise.all([api('/meta'), api('/products')])
      .then(([m, p]) => {
        setMeta(m);
        setProducts(p.products);
        // Opened from a product page: tick that product (only if it still exists).
        if (productId && p.products.some((x) => x._id === productId)) setSelectedProducts([productId]);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const track = (key) => (e) => {
    positions.current[key] = e.nativeEvent.layout.y;
  };

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const setValue = (name) => (value) => {
    setValues((v) => ({ ...v, [name]: value }));
    clearError(name);
  };

  const toggle = (list, setList, value, key) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
    clearError(key);
  };

  function scrollToFirstError(found) {
    const key = FIELD_ORDER.find((k) => found[k]);
    if (!key) {
      scrollRef.current && scrollRef.current.scrollTo({ y: 0, animated: true });
      return;
    }
    const y = formY.current + (positions.current[key] || 0);
    scrollRef.current && scrollRef.current.scrollTo({ y: Math.max(0, y - 16), animated: true });
  }

  async function onSubmit() {
    if (submitting) return;
    setFormError('');

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      scrollToFirstError(found);
      return;
    }

    setSubmitting(true);
    try {
      const { enquiry } = await api('/enquiries', {
        method: 'POST',
        body: {
          name: values.name.trim(),
          company: values.company.trim(),
          phone: values.phone,
          email: values.email.trim(),
          occasion: values.occasion,
          units: Number(values.units),
          budgetPerUnit: values.budgetPerUnit,
          deliveryDate: values.deliveryDate,
          products: selectedProducts,
          customisation,
          message: values.message.trim(),
          source: 'app',
        },
      });

      // Keep a copy on this phone for the "My enquiries" tab.
      await saveMyEnquiry(enquiry);
      // replace (not navigate) so Back does not return to a filled-in form.
      navigation.replace('ThankYou', { ref: enquiry.id });
    } catch (err) {
      if (err instanceof ApiError && err.details.length) {
        const mapped = {};
        err.details.forEach((d) => {
          mapped[d.field.split('.')[0]] = d.message;
        });
        setErrors(mapped);
        setFormError('Please fix the highlighted fields.');
        scrollToFirstError(mapped);
      } else {
        setFormError(err.message);
        scrollRef.current && scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      setSubmitting(false);
    }
  }

  if (loading) return <View style={s.screen}><Loading /></View>;
  if (loadError) {
    return (
      <View style={[s.screen, s.content]}>
        <ErrorBox message={loadError} onRetry={load} />
      </View>
    );
  }

  const occasionOptions = meta.occasions.map((o) => ({ value: o, label: o }));
  const budgetOptions = [{ value: '', label: 'Not sure yet' }, ...meta.budgetBands.map((b) => ({ value: b.key, label: b.label }))];
  const minimumDate = parseLocalDate(localToday());

  return (
    <ScrollView ref={scrollRef} style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Send an enquiry</Text>
      <Text style={s.sub}>Fields marked * are required. We will reach out on your phone or email.</Text>

      {formError ? (
        <View style={s.alert} accessibilityRole="alert">
          <Text style={s.alertText}>{formError}</Text>
        </View>
      ) : null}

      <View
        onLayout={(e) => {
          formY.current = e.nativeEvent.layout.y;
        }}
      >
        <TextField
          ref={(r) => (inputs.current.name = r)}
          label="Your name"
          required
          value={values.name}
          onChangeText={setValue('name')}
          error={errors.name}
          onLayout={track('name')}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => inputs.current.company && inputs.current.company.focus()}
        />
        <TextField
          ref={(r) => (inputs.current.company = r)}
          label="Company"
          required
          value={values.company}
          onChangeText={setValue('company')}
          error={errors.company}
          onLayout={track('company')}
          textContentType="organizationName"
          returnKeyType="next"
          onSubmitEditing={() => inputs.current.phone && inputs.current.phone.focus()}
        />
        <TextField
          ref={(r) => (inputs.current.phone = r)}
          label="Phone"
          required
          hint="10-digit mobile, +91 is fine"
          value={values.phone}
          onChangeText={setValue('phone')}
          error={errors.phone}
          onLayout={track('phone')}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          onSubmitEditing={() => inputs.current.email && inputs.current.email.focus()}
        />
        <TextField
          ref={(r) => (inputs.current.email = r)}
          label="Work email"
          required
          value={values.email}
          onChangeText={setValue('email')}
          error={errors.email}
          onLayout={track('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
        />

        <Select
          label="Occasion"
          required
          value={values.occasion}
          options={occasionOptions}
          placeholder="Select an occasion"
          onChange={setValue('occasion')}
          error={errors.occasion}
          onLayout={track('occasion')}
        />
        <TextField
          label="Number of units"
          required
          value={values.units}
          onChangeText={setValue('units')}
          error={errors.units}
          onLayout={track('units')}
          keyboardType="number-pad"
          maxLength={7}
        />
        <Select
          label="Budget per unit"
          value={values.budgetPerUnit}
          options={budgetOptions}
          placeholder="Not sure yet"
          onChange={setValue('budgetPerUnit')}
          error={errors.budgetPerUnit}
          onLayout={track('budgetPerUnit')}
        />
        <DateField
          label="Delivery date"
          value={values.deliveryDate}
          onChange={setValue('deliveryDate')}
          minimumDate={minimumDate}
          error={errors.deliveryDate}
          onLayout={track('deliveryDate')}
        />

        <View style={s.box} onLayout={track('products')}>
          <Text style={s.legend}>Products you are interested in</Text>
          {products.map((p) => (
            <Checkbox
              key={p._id}
              label={p.name}
              sub={p.category}
              checked={selectedProducts.includes(p._id)}
              onPress={() => toggle(selectedProducts, setSelectedProducts, p._id, 'products')}
            />
          ))}
        </View>
        {errors.products ? <Text style={s.boxError}>{errors.products}</Text> : null}

        <View style={s.box} onLayout={track('customisation')}>
          <Text style={s.legend}>Customisation needed</Text>
          {meta.customisations.map((c) => (
            <Checkbox
              key={c}
              label={c}
              checked={customisation.includes(c)}
              onPress={() => toggle(customisation, setCustomisation, c, 'customisation')}
            />
          ))}
        </View>

        <TextField
          label="Message"
          hint={`Anything else we should know? ${values.message.length}/1000`}
          value={values.message}
          onChangeText={setValue('message')}
          error={errors.message}
          onLayout={track('message')}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
      </View>

      <Button title={submitting ? 'Sending…' : 'Send enquiry'} loading={submitting} onPress={onSubmit} />
    </ScrollView>
  );
}
