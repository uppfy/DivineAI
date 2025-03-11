import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Divine Comfort - A place for spiritual growth and community';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #f9f5ff, #ffffff)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#7c3aed',
            marginBottom: '20px',
          }}
        >
          Divine Comfort
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#4b5563',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          A place for spiritual growth and community
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 