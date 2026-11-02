import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = buildMetadata({
  title: 'Thank You',
  description: 'Your enquiry has been received by the Tribe Green team.',
  path: '/thank-you',
  noindex: true,
});

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function ThankYouPage({ searchParams }) {
  const ref = first(searchParams.ref);
  const shortRef = ref && /^[a-f\d]{24}$/i.test(ref) ? ref.slice(-6).toUpperCase() : '';

  return (
    <div className="container section center">
      <h1>Thank you, we have your enquiry</h1>
      <p className="muted">The Tribe Green team will get back to you shortly on the phone or email you shared.</p>
      {shortRef && (
        <p>
          Reference: <strong>{shortRef}</strong>
        </p>
      )}
      <div className="actions" style={{ justifyContent: 'center' }}>
        <Link href="/" className="btn">
          Back to catalogue
        </Link>
        <WhatsAppButton
          message={`Hi Tribe Green, I just sent an enquiry${shortRef ? ` (ref ${shortRef})` : ''}. Please confirm you received it.`}
        >
          Message us on WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  );
}
