/**
 * ItcenLogo - ITCEN ENTEC 로고 컴포넌트
 * 원본 이미지를 참고하여 SVG로 재현
 */

import React from 'react';

interface ItcenLogoProps {
  size?: number;
  className?: string;
}

const ItcenLogo: React.FC<ItcenLogoProps> = ({
  size = 32,
  className
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 파란색 기하학적 도형 */}
      <g>
        {/* 외곽 원형 부분 */}
        <path
          d="M4 16C4 8.268 10.268 2 18 2C25.732 2 32 8.268 32 16C32 23.732 25.732 30 18 30C10.268 30 4 23.732 4 16Z"
          fill="#2563eb"
          fillOpacity="0.2"
        />

        {/* 내부 기하학적 패턴 */}
        <path
          d="M8 16L18 8L28 16L18 24L8 16Z"
          fill="#2563eb"
        />

        {/* 중앙 삼각형 */}
        <path
          d="M18 12L22 16L18 20L14 16L18 12Z"
          fill="white"
        />
      </g>

      {/* ITCEN 텍스트 */}
      <g fill="#1f2937">
        <rect x="38" y="8" width="2" height="16" />
        <rect x="42" y="8" width="8" height="2" />
        <rect x="45" y="8" width="2" height="16" />

        <path d="M54 10C54 8.895 54.895 8 56 8H60C61.105 8 62 8.895 62 10V12C62 13.105 61.105 14 60 14H56V22C56 23.105 55.105 24 54 24V10Z" />
        <rect x="54" y="15" width="6" height="2" />

        <path d="M66 10C66 8.895 66.895 8 68 8H74C75.105 8 76 8.895 76 10V12H74V10H68V22H74V20H76V22C76 23.105 75.105 24 74 24H68C66.895 24 66 23.105 66 22V10Z" />

        <rect x="80" y="8" width="8" height="2" />
        <rect x="80" y="8" width="2" height="16" />
        <rect x="80" y="15" width="6" height="2" />
        <rect x="80" y="22" width="8" height="2" />

        <rect x="92" y="8" width="2" height="16" />
        <path d="M96 8L96 16L102 8H104L98 16L104 24H102L96 16V24H94V8H96Z" />
      </g>

      {/* ENTEC 텍스트 (파란색) */}
      <g fill="#2563eb">
        <rect x="38" y="26" width="8" height="2" />
        <rect x="38" y="26" width="2" height="4" />
        <rect x="38" y="28" width="6" height="1" />

        <rect x="48" y="26" width="2" height="4" />
        <path d="M52 26L52 28L56 26H58L54 28L58 30H56L52 28V30H50V26H52Z" />

        <rect x="60" y="26" width="6" height="1" />
        <rect x="62" y="26" width="2" height="4" />

        <rect x="68" y="26" width="8" height="1" />
        <rect x="68" y="26" width="2" height="4" />
        <rect x="68" y="28" width="6" height="1" />
        <rect x="68" y="29" width="8" height="1" />

        <path d="M80 28C80 26.895 80.895 26 82 26H88C89.105 26 90 26.895 90 28V30H88V28H82V30H88V30C88 30.552 87.552 31 87 31H82C80.895 31 80 30.105 80 29V28Z" />
      </g>
    </svg>
  );
};

export default ItcenLogo;