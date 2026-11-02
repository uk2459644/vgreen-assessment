import Link from 'next/link';
import { priceRange } from '@/lib/format';

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product._id}`} className="card">
      <div className="card-img">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">
          {priceRange(product)} <small>per unit</small>
        </p>
        <p className="muted clamp">{product.description}</p>
      </div>
    </Link>
  );
}
