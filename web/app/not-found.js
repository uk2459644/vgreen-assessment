import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Page not found',
  description: 'The page you are looking for does not exist.',
  path: '/404',
  noindex: true,
});

export default function NotFound() {
  return (
    <div className="container section center">
      <h1>Page not found</h1>
      <p className="muted">That page does not exist or the product was removed.</p>
      <Link href="/" className="btn">
        Back to catalogue
      </Link>
    </div>
  );
}
