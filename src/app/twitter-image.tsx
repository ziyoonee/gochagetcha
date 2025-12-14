import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '가차겟차 - 전국 가차샵과 캡슐토이 정보';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FCE7F3 25%, #F5F3FF 50%, #FDF2F8 75%, #FFF1F2 100%)',
          position: 'relative',
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,181,253,0.3) 0%, transparent 70%)',
          }}
        />

        {/* 캡슐 장식들 */}
        <div style={{ position: 'absolute', top: 80, left: 120, display: 'flex' }}>
          <svg viewBox="0 0 40 52" width="60" height="78" style={{ opacity: 0.6 }}>
            <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2" />
            <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="2" />
            <rect x="6" y="20" width="28" height="4" fill="#FDA4AF" />
          </svg>
        </div>

        <div style={{ position: 'absolute', top: 60, right: 150, display: 'flex', transform: 'rotate(15deg)' }}>
          <svg viewBox="0 0 40 52" width="50" height="65" style={{ opacity: 0.5 }}>
            <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2" />
            <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="2" />
            <rect x="6" y="20" width="28" height="4" fill="#C4B5FD" />
          </svg>
        </div>

        <div style={{ position: 'absolute', bottom: 100, right: 200, display: 'flex', transform: 'rotate(8deg)' }}>
          <svg viewBox="0 0 40 52" width="55" height="71" style={{ opacity: 0.5 }}>
            <path d="M20 4 C10 4 6 12 6 20 L34 20 C34 12 30 4 20 4 Z" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="2" />
            <path d="M6 24 C6 32 10 40 20 40 C30 40 34 32 34 24 L6 24 Z" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="6" y="20" width="28" height="4" fill="#7DD3FC" />
          </svg>
        </div>

        {/* 메인 가차 머신 */}
        <div style={{ display: 'flex', marginBottom: 30 }}>
          <svg viewBox="0 0 120 160" width="180" height="240">
            <rect x="10" y="30" width="100" height="120" rx="15" fill="white" stroke="#FDA4AF" strokeWidth="3" />
            <ellipse cx="60" cy="30" rx="40" ry="12" fill="#FECDD3" />
            <ellipse cx="60" cy="27" rx="35" ry="8" fill="#FFF1F2" />
            <ellipse cx="60" cy="70" rx="35" ry="30" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
            <ellipse cx="50" cy="60" rx="8" ry="6" fill="white" fillOpacity="0.6" />
            <circle cx="45" cy="75" r="10" fill="#FECDD3" stroke="#FDA4AF" strokeWidth="1.5" />
            <circle cx="70" cy="70" r="10" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="1.5" />
            <circle cx="55" cy="85" r="10" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="1.5" />
            <circle cx="75" cy="85" r="8" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="1.5" />
            <rect x="95" y="70" width="20" height="12" rx="6" fill="#FDA4AF" />
            <circle cx="112" cy="76" r="8" fill="#FB7185" stroke="#F43F5E" strokeWidth="2" />
            <rect x="35" y="115" width="50" height="25" rx="8" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
            <path d="M40 127 L80 127" stroke="#FECDD3" strokeWidth="3" strokeLinecap="round" />
            <path d="M60 20 C58 18 55 18 53 20 C51 22 51 25 53 27 L60 33 L67 27 C69 25 69 22 67 20 C65 18 62 18 60 20" fill="#FB7185" />
          </svg>
        </div>

        {/* 타이틀 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FB7185 0%, #EC4899 50%, #8B5CF6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 16,
              letterSpacing: -2,
            }}
          >
            가차겟차
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#6B7280',
              fontWeight: 500,
            }}
          >
            전국 가차샵과 캡슐토이 정보를 한눈에
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
