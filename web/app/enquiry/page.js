import { api } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata = buildMetadata({
  title: 'Send an Enquiry',
  description:
    'Tell us your occasion, quantity and budget and the Tribe Green team will get back to you with a corporate gifting quote.',
  path: '/enquiry',
});

export const dynamic = 'force-dynamic';

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function EnquiryPage({ searchParams }) {
  let meta = null;
  let products = [];
  let error = '';
  try {
    const [m, p] = await Promise.all([api('/meta'), api('/products')]);
    meta = m;
    products = p.products;
  } catch (err) {
    error = err.message;
  }

  // /enquiry?product=<id> (from a product page) pre-ticks that product.
  const wanted = first(searchParams.product);
  const initialProductIds = products.some((p) => p._id === wanted) ? [wanted] : [];

  return (
    <div className="container section">
      <div className="form-card">
        <h1>Send an enquiry</h1>
        <p className="muted">Fields marked * are required. We will reach out on your phone or email.</p>
      </div>

      {error ? (
        <div className="alert form-card" role="alert">
          {error}
        </div>
      ) : (
        <EnquiryForm meta={meta} products={products} initialProductIds={initialProductIds} />
      )}
    </div>
  );
}
