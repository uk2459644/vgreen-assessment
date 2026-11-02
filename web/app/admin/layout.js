import { buildMetadata } from '@/lib/seo';

// page.js is a client component and cannot export metadata, so it lives here.
export const metadata = buildMetadata({
  title: 'Admin',
  description: 'Tribe Green enquiries dashboard (login required).',
  path: '/admin',
  noindex: true,
});

export default function AdminLayout({ children }) {
  return children;
}
