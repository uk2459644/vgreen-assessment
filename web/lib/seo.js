import { SITE_URL, SITE_NAME } from './config';

// Every page calls this so title, meta description and share image are never forgotten.
// - title gets " | Tribe Green" appended by the template in app/layout.js
// - image: pass a product photo, otherwise a branded card from /og is used
export function buildMetadata({ title, description, path = '/', image, noindex = false }) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image
    ? { url: image, alt: title }
    : { url: `${SITE_URL}/og?title=${encodeURIComponent(title)}`, width: 1200, height: 630, alt: title };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
