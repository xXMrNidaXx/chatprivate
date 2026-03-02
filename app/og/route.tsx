import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #1e1b4b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔒</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          ChatPrivate
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#a78bfa',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          The AI chat that forgets
        </div>
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 24,
            color: '#d1d5db',
          }}
        >
          <span>✅ Zero server storage</span>
          <span>✅ Free to use</span>
          <span>✅ $12/mo unlimited</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
