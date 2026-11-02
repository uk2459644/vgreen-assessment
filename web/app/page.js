import { Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';

export const metadata = buildMetadata({
  title: 'Corporate Gifts Catalogue',
  description:
    'Browse corporate gifts by category, occasion and budget: drinkware, apparel, work essentials and wellness with logo printing and engraving.',
  path: '/',
});

// Rendered on the server for every request so filters, SEO and the first paint all see real data.
export const dynamic = 'force-dynamic';

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function CataloguePage({ searchParams }) {
  const filters = {
    category: first(searchParams.category),
    occasion: first(searchParams.occasion),
    budget: first(searchParams.budget),
    search: first(searchParams.search),
  };

  let meta = null;
  let products = [];
  let error = '';
  try {
    const [m, p] = await Promise.all([api('/meta'), api('/products', { params: filters })]);
    meta = m;
    products = p.products;
  } catch (err) {
    error = err.message;
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Corporate gifts your people will actually use</h1>
          <p>
            Welcome kits, festive gifts, client gifts and branded merchandise. Pick products, tell us your occasion and
            budget, and we will send you a quote.
          </p>
        </div>
      </section>

      <div className="container section">
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        {meta && (
          <Suspense fallback={null}>
            <Filters meta={meta} />
          </Suspense>
        )}

        {!error && (
          <>
            <div className="result-bar">
              <span className="muted">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
              <Link href="/enquiry" className="btn btn-small">
                Send enquiry
              </Link>
            </div>

            {products.length ? (
              <div className="grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h2>No products match these filters</h2>
                <p className="muted">Try a different category, occasion or budget.</p>
                <Link href="/" className="btn btn-outline">
                  Clear filters
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
