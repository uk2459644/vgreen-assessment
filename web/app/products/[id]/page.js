import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { priceRange } from '@/lib/format';
import WhatsAppButton from '@/components/WhatsAppButton';

export const dynamic = 'force-dynamic';

async function loadProduct(id) {
  try {
    const { product } = await api(`/products/${id}`);
    return product;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// Title, description and share image come from the product itself.
export async function generateMetadata({ params }) {
  let product = null;
  try {
    product = await loadProduct(params.id);
  } catch {
    // API down: fall through to generic metadata
  }

  if (!product) {
    return buildMetadata({
      title: 'Product',
      description: 'Corporate gift from the Tribe Green catalogue.',
      path: `/products/${params.id}`,
      noindex: true,
    });
  }

  const description =
    `${product.description} ${priceRange(product)} per unit. Customisation: ${product.customisations.join(', ')}.`.slice(0, 200);

  return buildMetadata({
    title: product.name,
    description,
    path: `/products/${params.id}`,
    image: product.image,
  });
}

export default async function ProductPage({ params }) {
  let product;
  try {
    product = await loadProduct(params.id);
  } catch (err) {
    return (
      <div className="container section">
        <div className="alert" role="alert">
          {err.message}
        </div>
        <Link href="/" className="btn btn-outline">
          Back to catalogue
        </Link>
      </div>
    );
  }
  if (!product) notFound();

  const waMessage = `Hi Tribe Green, I'm interested in "${product.name}" (${priceRange(product)} per unit). Could you share more details and a quote?`;

  return (
    <div className="container section">
      <nav className="breadcrumb muted" aria-label="Breadcrumb">
        <Link href="/">Catalogue</Link> / <Link href={`/?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
      </nav>

      <div className="detail">
        <div className="detail-img">
          <img src={product.image} alt={product.name} />
        </div>

        <div>
          <span className="badge">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price">
            {priceRange(product)} <small>per unit</small>
          </p>
          <p>{product.description}</p>

          <h2 style={{ fontSize: '1.05rem' }}>Suits these occasions</h2>
          <ul className="chips">
            {product.occasions.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          <h2 style={{ fontSize: '1.05rem' }}>Customisation available</h2>
          <ul className="chips">
            {product.customisations.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="actions">
            <Link href={`/enquiry?product=${product._id}`} className="btn">
              Enquire about this product
            </Link>
            <WhatsAppButton message={waMessage}>Chat on WhatsApp</WhatsAppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
