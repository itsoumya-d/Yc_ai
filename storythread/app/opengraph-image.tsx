import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StoryThread — Write better stories with AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E293B 0%, #7C3AED 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 32,
            lineHeight: 1,
          }}
        >
          📖
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          StoryThread
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.80)',
            textAlign: 'center',
            fontWeight: 400,
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Write better stories with AI
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 100,
            padding: '8px 20px',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.90)', fontWeight: 500 }}>
            Powered by AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
