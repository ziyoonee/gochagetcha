const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`;

let isLoading = false;
let isLoaded = false;

export function loadKakaoMapSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (isLoaded && window.kakao?.maps) {
      resolve();
      return;
    }

    // 로딩 중이면 로드 완료 대기
    if (isLoading) {
      const checkLoaded = setInterval(() => {
        if (isLoaded && window.kakao?.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    // 이미 스크립트가 존재하는 경우
    if (window.kakao?.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    isLoading = true;

    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        isLoaded = true;
        isLoading = false;
        resolve();
      });
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('카카오맵 SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });
}

export function createCapsuleMarkerElement(
  shopId: string,
  isSelected: boolean,
  isOpened: boolean,
  onClick: (shopId: string) => void
): HTMLDivElement {
  const topFill = isSelected ? '#FEF3C7' : '#FFF1F2';
  const topStroke = isSelected ? '#F59E0B' : '#FDA4AF';
  const bottomFill = isSelected ? '#FBBF24' : '#FB7185';
  const bottomStroke = isSelected ? '#F59E0B' : '#E11D48';
  const middleFill = isSelected ? '#F59E0B' : '#E11D48';

  const container = document.createElement('div');
  container.className = 'capsule-marker';
  container.dataset.shopId = shopId;
  container.style.cssText = `
    cursor: pointer;
    transition: transform 0.3s;
    ${isSelected ? 'transform: scale(1.1);' : ''}
  `;

  const starElement = isOpened
    ? `<g>
        <circle cx="24" cy="8" r="8" fill="#FCD34D" stroke="#F59E0B" stroke-width="2">
          <animate attributeName="cy" values="8;4;8" dur="0.5s" repeatCount="indefinite"/>
        </circle>
        <text x="24" y="13" text-anchor="middle" font-size="12" fill="#92400E">★</text>
      </g>`
    : '';

  const topTransform = isOpened
    ? 'transform: translateY(-16px) rotate(-20deg); transform-origin: 24px 24px;'
    : '';

  container.innerHTML = `
    <svg viewBox="0 -20 48 84" style="width: 56px; height: 80px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); overflow: visible;">
      <g style="${topTransform} transition: transform 0.5s;">
        <path d="M24 4 C10 4 6 14 6 24 L42 24 C42 14 38 4 24 4 Z" fill="${topFill}" stroke="${topStroke}" stroke-width="2"/>
        <ellipse cx="16" cy="14" rx="5" ry="4" fill="white" opacity="0.6"/>
      </g>
      ${starElement}
      <path d="M6 28 C6 38 10 48 24 48 C38 48 42 38 42 28 L6 28 Z" fill="${bottomFill}" stroke="${bottomStroke}" stroke-width="2"/>
      <rect x="6" y="24" width="36" height="4" fill="${middleFill}"/>
      <path d="M18 48 L24 60 L30 48" fill="${bottomFill}"/>
    </svg>
  `;

  // 클릭 이벤트 직접 연결
  container.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick(shopId);
  });

  return container;
}

export function updateCapsuleMarkerElement(
  element: HTMLDivElement,
  isSelected: boolean,
  isOpened: boolean
): void {
  const topFill = isSelected ? '#FEF3C7' : '#FFF1F2';
  const topStroke = isSelected ? '#F59E0B' : '#FDA4AF';
  const bottomFill = isSelected ? '#FBBF24' : '#FB7185';
  const bottomStroke = isSelected ? '#F59E0B' : '#E11D48';
  const middleFill = isSelected ? '#F59E0B' : '#E11D48';

  element.style.transform = isSelected ? 'scale(1.1)' : '';

  const starElement = isOpened
    ? `<g>
        <circle cx="24" cy="8" r="8" fill="#FCD34D" stroke="#F59E0B" stroke-width="2">
          <animate attributeName="cy" values="8;4;8" dur="0.5s" repeatCount="indefinite"/>
        </circle>
        <text x="24" y="13" text-anchor="middle" font-size="12" fill="#92400E">★</text>
      </g>`
    : '';

  const topTransform = isOpened
    ? 'transform: translateY(-16px) rotate(-20deg); transform-origin: 24px 24px;'
    : '';

  const svg = element.querySelector('svg');
  if (svg) {
    svg.innerHTML = `
      <g style="${topTransform} transition: transform 0.5s;">
        <path d="M24 4 C10 4 6 14 6 24 L42 24 C42 14 38 4 24 4 Z" fill="${topFill}" stroke="${topStroke}" stroke-width="2"/>
        <ellipse cx="16" cy="14" rx="5" ry="4" fill="white" opacity="0.6"/>
      </g>
      ${starElement}
      <path d="M6 28 C6 38 10 48 24 48 C38 48 42 38 42 28 L6 28 Z" fill="${bottomFill}" stroke="${bottomStroke}" stroke-width="2"/>
      <rect x="6" y="24" width="36" height="4" fill="${middleFill}"/>
      <path d="M18 48 L24 60 L30 48" fill="${bottomFill}"/>
    `;
  }
}
