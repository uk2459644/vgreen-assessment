import { ImageResponse } from 'next/og';

// Generates the share image (1200x630) used when a page link is pasted into
// WhatsApp, LinkedIn, Slack etc. Example: /og?title=Corporate%20Gifts
export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Corporate gifting, made simple').slice(0, 90);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0b3d2e, #1f7a4d)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: 4 }}>TRIBE GREEN</div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.85 }}>
          Welcome kits, festive gifts, client gifts and branded merchandise
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
