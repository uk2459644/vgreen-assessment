import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SITE_URL, GA_ID } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Corporate Gifting | Tribe Green', template: '%s | Tribe Green' },
  description:
    'Corporate gifting by Tribe Green: welcome kits, festive gifts, client gifts and branded merchandise with logo printing and engraving.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f7a4d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton
          className="wa-float"
          message="Hi Tribe Green, I'd like to know more about corporate gifting options."
        >
          WhatsApp
        </WhatsAppButton>

        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
