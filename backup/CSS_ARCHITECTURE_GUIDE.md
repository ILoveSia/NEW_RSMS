# CSS 아키텍처 가이드

## 📋 개요
RSMS 프로젝트는 **컴포넌트와 스타일을 완전히 분리**하는 아키텍처를 채택합니다.
CSS Modules + SCSS를 사용하여 스타일을 독립적으로 관리합니다.

## 🎯 핵심 원칙

### 1. 스타일 분리 원칙
- **NO CSS-in-JS**: styled-components, emotion 사용 금지
- **NO 인라인 스타일**: style, sx props 사용 금지
- **CSS Modules 필수**: 모든 컴포넌트는 .module.scss 파일 사용
- **SCSS 변수 활용**: 하드코딩된 값 대신 변수 사용

### 2. 파일 구조
```
ComponentName/
├── ComponentName.tsx          # 순수 컴포넌트 로직
├── ComponentName.module.scss  # 스타일 정의
├── ComponentName.types.ts     # 타입 정의
├── ComponentName.test.tsx     # 테스트
├── ComponentName.stories.tsx  # Storybook
└── index.ts                  # export
```

## 📁 스타일 디렉토리 구조

```
src/shared/styles/
├── variables/          # SCSS 변수
│   ├── _colors.scss   # 색상 팔레트
│   ├── _spacing.scss  # 간격, 여백
│   ├── _typography.scss # 폰트, 텍스트
│   ├── _shadows.scss  # 그림자 효과
│   ├── _breakpoints.scss # 반응형 브레이크포인트
│   └── index.scss     # 변수 통합
│
├── mixins/            # 재사용 믹스인
│   ├── _layout.scss   # 레이아웃 관련
│   ├── _responsive.scss # 반응형 헬퍼
│   ├── _effects.scss  # 애니메이션, 효과
│   ├── _forms.scss    # 폼 요소 스타일
│   └── index.scss     # 믹스인 통합
│
├── globals/           # 전역 스타일
│   ├── reset.scss     # CSS 리셋
│   ├── base.scss      # 기본 요소 스타일
│   ├── utilities.scss # 유틸리티 클래스
│   └── index.scss     # 전역 스타일 통합
│
└── themes/            # 테마 정의
    ├── light.scss     # 라이트 테마
    ├── dark.scss      # 다크 테마
    └── index.scss     # 테마 통합
```

## 🎨 SCSS 변수 시스템

### 색상 변수
```scss
// variables/_colors.scss
// Primary Palette
$color-primary: #1976d2;
$color-primary-light: #42a5f5;
$color-primary-dark: #1565c0;
$color-primary-contrast: #ffffff;

// Secondary Palette
$color-secondary: #dc004e;
$color-secondary-light: #f05545;
$color-secondary-dark: #9a0036;
$color-secondary-contrast: #ffffff;

// Semantic Colors
$color-success: #4caf50;
$color-warning: #ff9800;
$color-error: #f44336;
$color-info: #2196f3;

// Neutral Colors
$color-white: #ffffff;
$color-black: #000000;
$color-gray-50: #fafafa;
$color-gray-100: #f5f5f5;
$color-gray-200: #eeeeee;
$color-gray-300: #e0e0e0;
$color-gray-400: #bdbdbd;
$color-gray-500: #9e9e9e;
$color-gray-600: #757575;
$color-gray-700: #616161;
$color-gray-800: #424242;
$color-gray-900: #212121;

// Background Colors
$color-background-default: $color-gray-50;
$color-background-paper: $color-white;
$color-background-overlay: rgba(0, 0, 0, 0.5);

// Text Colors
$color-text-primary: rgba(0, 0, 0, 0.87);
$color-text-secondary: rgba(0, 0, 0, 0.6);
$color-text-disabled: rgba(0, 0, 0, 0.38);
$color-text-hint: rgba(0, 0, 0, 0.38);
```

### 간격 시스템
```scss
// variables/_spacing.scss
// Base unit: 8px
$spacing-unit: 8px;

// Spacing Scale
$spacing-xxs: $spacing-unit * 0.25;  // 2px
$spacing-xs: $spacing-unit * 0.5;    // 4px
$spacing-sm: $spacing-unit;          // 8px
$spacing-md: $spacing-unit * 2;      // 16px
$spacing-lg: $spacing-unit * 3;      // 24px
$spacing-xl: $spacing-unit * 4;      // 32px
$spacing-xxl: $spacing-unit * 6;     // 48px
$spacing-xxxl: $spacing-unit * 8;    // 64px

// Component Specific
$button-padding-x: $spacing-md;
$button-padding-y: $spacing-sm;
$input-padding-x: $spacing-md;
$input-padding-y: $spacing-sm;
$card-padding: $spacing-lg;
```

### 타이포그래피
```scss
// variables/_typography.scss
// Font Families
$font-family-base: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'Fira Code', 'SF Mono', Monaco, monospace;

// Font Sizes
$font-size-xxs: 0.625rem;   // 10px
$font-size-xs: 0.75rem;     // 12px
$font-size-sm: 0.875rem;    // 14px
$font-size-base: 1rem;      // 16px
$font-size-lg: 1.125rem;    // 18px
$font-size-xl: 1.25rem;     // 20px
$font-size-xxl: 1.5rem;     // 24px
$font-size-xxxl: 2rem;      // 32px

// Font Weights
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line Heights
$line-height-tight: 1.2;
$line-height-base: 1.5;
$line-height-relaxed: 1.75;

// Letter Spacing
$letter-spacing-tight: -0.02em;
$letter-spacing-normal: 0;
$letter-spacing-wide: 0.025em;
```

## 🔧 믹스인 라이브러리

### 레이아웃 믹스인
```scss
// mixins/_layout.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin size($width, $height: $width) {
  width: $width;
  height: $height;
}

@mixin aspect-ratio($width, $height) {
  position: relative;
  
  &::before {
    content: '';
    display: block;
    padding-top: ($height / $width) * 100%;
  }
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
```

### 반응형 믹스인
```scss
// mixins/_responsive.scss
// Breakpoints
$breakpoint-xs: 0;
$breakpoint-sm: 600px;
$breakpoint-md: 960px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;

// Mobile First
@mixin xs {
  @media (min-width: $breakpoint-xs) {
    @content;
  }
}

@mixin sm {
  @media (min-width: $breakpoint-sm) {
    @content;
  }
}

@mixin md {
  @media (min-width: $breakpoint-md) {
    @content;
  }
}

@mixin lg {
  @media (min-width: $breakpoint-lg) {
    @content;
  }
}

@mixin xl {
  @media (min-width: $breakpoint-xl) {
    @content;
  }
}

// Desktop First
@mixin mobile {
  @media (max-width: #{$breakpoint-sm - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: $breakpoint-sm) and (max-width: #{$breakpoint-md - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: $breakpoint-md) {
    @content;
  }
}
```

### 효과 믹스인
```scss
// mixins/_effects.scss
@mixin hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

@mixin hover-opacity($opacity: 0.8) {
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: $opacity;
  }
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@mixin transition($property: all, $duration: 0.2s, $timing: ease) {
  transition: $property $duration $timing;
}

@mixin card {
  background-color: $color-background-paper;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $card-padding;
}

@mixin scrollbar {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: $border-radius-sm;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-gray-400;
    border-radius: $border-radius-sm;
    
    &:hover {
      background: $color-gray-500;
    }
  }
}
```

## 📝 컴포넌트 스타일 작성 가이드

### 기본 구조
```scss
// Button.module.scss
@import '@/shared/styles/variables';
@import '@/shared/styles/mixins';

.button {
  // 기본 스타일
  @include transition;
  padding: $button-padding-y $button-padding-x;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-md;
  border: none;
  cursor: pointer;
  
  // 상태별 스타일
  &:hover {
    @include hover-opacity(0.9);
  }
  
  &:focus {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  // 변형 스타일
  &--primary {
    background-color: $color-primary;
    color: $color-primary-contrast;
  }
  
  &--secondary {
    background-color: $color-secondary;
    color: $color-secondary-contrast;
  }
  
  &--large {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
  }
  
  &--small {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }
  
  // 반응형
  @include mobile {
    width: 100%;
  }
}

.loadingIcon {
  margin-right: $spacing-xs;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 컴포넌트에서 사용
```typescript
// Button.tsx
import React from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.scss';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className,
  children,
  onClick
}) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[`button--${variant}`],
        size !== 'medium' && styles[`button--${size}`],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className={styles.loadingIcon}>⚪</span>}
      {children}
    </button>
  );
};
```

## 🎨 BEM 명명 규칙

### 기본 패턴
```scss
// Block
.block {}

// Element (__)
.block__element {}

// Modifier (--)
.block--modifier {}
.block__element--modifier {}
```

### 실제 예시
```scss
// Card 컴포넌트
.card {
  @include card;
  
  &__header {
    @include flex-between;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $color-gray-200;
  }
  
  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
  }
  
  &__content {
    padding: $spacing-md 0;
  }
  
  &__footer {
    padding-top: $spacing-md;
    border-top: 1px solid $color-gray-200;
  }
  
  // Modifiers
  &--elevated {
    box-shadow: $shadow-lg;
  }
  
  &--borderless {
    box-shadow: none;
    border: none;
  }
}
```

## 🔧 유틸리티 클래스

### 글로벌 유틸리티
```scss
// globals/utilities.scss
// Display
.d-none { display: none !important; }
.d-block { display: block !important; }
.d-flex { display: flex !important; }
.d-inline { display: inline !important; }
.d-inline-block { display: inline-block !important; }

// Flexbox
.flex-row { flex-direction: row !important; }
.flex-column { flex-direction: column !important; }
.justify-start { justify-content: flex-start !important; }
.justify-center { justify-content: center !important; }
.justify-end { justify-content: flex-end !important; }
.justify-between { justify-content: space-between !important; }
.align-start { align-items: flex-start !important; }
.align-center { align-items: center !important; }
.align-end { align-items: flex-end !important; }

// Spacing
@each $size, $value in (
  'xs': $spacing-xs,
  'sm': $spacing-sm,
  'md': $spacing-md,
  'lg': $spacing-lg,
  'xl': $spacing-xl
) {
  .m-#{$size} { margin: $value !important; }
  .mt-#{$size} { margin-top: $value !important; }
  .mb-#{$size} { margin-bottom: $value !important; }
  .ml-#{$size} { margin-left: $value !important; }
  .mr-#{$size} { margin-right: $value !important; }
  .mx-#{$size} { margin-left: $value !important; margin-right: $value !important; }
  .my-#{$size} { margin-top: $value !important; margin-bottom: $value !important; }
  
  .p-#{$size} { padding: $value !important; }
  .pt-#{$size} { padding-top: $value !important; }
  .pb-#{$size} { padding-bottom: $value !important; }
  .pl-#{$size} { padding-left: $value !important; }
  .pr-#{$size} { padding-right: $value !important; }
  .px-#{$size} { padding-left: $value !important; padding-right: $value !important; }
  .py-#{$size} { padding-top: $value !important; padding-bottom: $value !important; }
}

// Text
.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-justify { text-align: justify !important; }
.text-truncate { @include truncate; }
.text-uppercase { text-transform: uppercase !important; }
.text-lowercase { text-transform: lowercase !important; }
.text-capitalize { text-transform: capitalize !important; }

// Colors
.text-primary { color: $color-primary !important; }
.text-secondary { color: $color-secondary !important; }
.text-success { color: $color-success !important; }
.text-danger { color: $color-error !important; }
.text-warning { color: $color-warning !important; }
.text-info { color: $color-info !important; }
.text-muted { color: $color-text-secondary !important; }
```

## 🚀 베스트 프랙티스

### DO ✅

1. **SCSS 변수 사용**
```scss
// Good
.button {
  padding: $spacing-sm $spacing-md;
  color: $color-primary;
}

// Bad
.button {
  padding: 8px 16px;  // 하드코딩
  color: #1976d2;     // 하드코딩
}
```

2. **믹스인 활용**
```scss
// Good
.header {
  @include flex-between;
  @include mobile {
    flex-direction: column;
  }
}
```

3. **BEM 명명 규칙 준수**
```scss
// Good
.card {}
.card__header {}
.card--elevated {}

// Bad
.card-header {}  // 잘못된 구분자
.cardHeader {}   // camelCase 사용 금지
```

4. **CSS Modules 활용**
```typescript
// Good
import styles from './Component.module.scss';
<div className={styles.container} />

// Bad
import './Component.scss';  // 글로벌 스타일
<div className="container" />
```

### DON'T ❌

1. **인라인 스타일 금지**
```typescript
// Bad
<div style={{ padding: '16px' }} />
<Box sx={{ margin: 2 }} />
```

2. **CSS-in-JS 금지**
```typescript
// Bad
const StyledButton = styled.button`
  padding: 16px;
`;
```

3. **하드코딩된 값 금지**
```scss
// Bad
.button {
  padding: 16px;        // 변수 사용해야 함
  color: #1976d2;       // 변수 사용해야 함
  border-radius: 8px;   // 변수 사용해야 함
}
```

4. **전역 스타일 남용 금지**
```scss
// Bad (전역 스코프 오염)
button {
  padding: 16px;
}

// Good (CSS Modules 스코프)
.button {
  padding: $spacing-md;
}
```

## 📋 체크리스트

프로젝트 시작 전:
- [ ] SCSS 변수 파일 생성
- [ ] 믹스인 파일 생성
- [ ] 글로벌 스타일 설정
- [ ] CSS Modules 설정 확인

컴포넌트 개발 시:
- [ ] .module.scss 파일 생성
- [ ] SCSS 변수 import
- [ ] 필요한 믹스인 import
- [ ] BEM 명명 규칙 적용
- [ ] 반응형 스타일 적용
- [ ] 하드코딩된 값 없음 확인

코드 리뷰 시:
- [ ] 인라인 스타일 없음
- [ ] CSS-in-JS 없음
- [ ] SCSS 변수 사용
- [ ] BEM 명명 규칙 준수
- [ ] 중복 스타일 없음