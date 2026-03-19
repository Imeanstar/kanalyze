import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kanalyze - 우리 단톡방, AI의 시선으로';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fontData = await fetch(
    'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR-Bold.ttf'
  ).then((res) => res.arrayBuffer());

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
          backgroundColor: '#0a0a14',
          color: 'white',
          fontFamily: '"NotoSansKR"',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '60px',
            padding: '100px 140px',
            background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(0,0,0,0))',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 120,
              fontWeight: 700,
              margin: '0 0 30px 0',
              color: '#d8b4fe',
            }}
          >
            KANALYZE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 50,
              fontWeight: 700,
              margin: 0,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            우리 단톡방, AI의 시선으로
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'NotoSansKR',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
