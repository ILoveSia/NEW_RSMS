# EMS Frontend

Entity Management System의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

### 핵심 프레임워크
- **React 18.3** - 사용자 인터페이스 라이브러리
- **TypeScript 5.5** - 정적 타입 검사
- **Vite 5.3** - 빌드 도구 및 개발 서버

### UI 라이브러리
- **Material-UI v5** - 기본 UI 컴포넌트
- **AG-Grid Community** - 데이터 그리드
- **CSS Modules + SCSS** - 스타일링 시스템

### 상태 관리
- **Zustand** - 전역 상태 관리
- **TanStack Query** - 서버 상태 관리
- **React Hook Form** - 폼 상태 관리

### 라우팅
- **React Router v6** - 클라이언트 사이드 라우팅

### 유틸리티
- **Axios** - HTTP 클라이언트
- **Date-fns** - 날짜 유틸리티
- **React Toastify** - 토스트 알림
- **Yup** - 스키마 검증

## 📁 프로젝트 구조

```
src/
├── components/          # 페이지별 컴포넌트
├── shared/              # 공유 리소스
│   └── components/      # 공통 컴포넌트
│       ├── atoms/       # 기본 컴포넌트 (Button, Input 등)
│       ├── molecules/   # 복합 컴포넌트 (SearchBar, FormField 등)
│       ├── organisms/   # 복잡한 컴포넌트 (DataGrid, Header 등)
│       └── templates/   # 레이아웃 템플릿
├── pages/               # 페이지 컴포넌트
├── hooks/               # 커스텀 훅
├── stores/              # Zustand 스토어
├── services/            # API 서비스
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
├── styles/              # SCSS 글로벌 스타일
│   ├── _variables.scss  # SCSS 변수
│   ├── _mixins.scss     # SCSS 믹신
│   ├── _base.scss       # 기본 스타일
│   └── index.scss       # 스타일 진입점
├── assets/              # 정적 자원
└── test/                # 테스트 설정
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 적절한 값을 설정하세요.

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

## 📜 사용 가능한 스크립트

### 개발
- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드된 앱 미리보기

### 코드 품질
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run type-check` - TypeScript 타입 검사
- `npm run format` - Prettier 포맷팅
- `npm run format:check` - Prettier 검사

### 테스트
- `npm run test` - 테스트 실행
- `npm run test:ui` - 테스트 UI 실행
- `npm run test:coverage` - 테스트 커버리지

### 스토리북
- `npm run storybook` - 스토리북 개발 서버
- `npm run build-storybook` - 스토리북 빌드

## 🎨 스타일링 가이드

### CSS Modules + SCSS

모든 컴포넌트 스타일은 CSS Modules를 사용하여 격리됩니다.

```typescript
// Button.tsx
import styles from './Button.module.scss';

export const Button = ({ children, variant = 'primary' }) => (
  <button className={`${styles.button} ${styles[`button--${variant}`]}`}>
    {children}
  </button>
);
```

```scss
// Button.module.scss
.button {
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  font-weight: $font-weight-medium;
  @include transition(all, 0.2s);
  
  &--primary {
    background-color: $color-primary;
    color: $color-primary-contrast;
  }
}
```

### SCSS 변수 사용

모든 SCSS 파일에서 전역 변수와 믹신을 사용할 수 있습니다.

```scss
.component {
  color: $color-text-primary;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  @include transition(transform);
  
  &:hover {
    @include hover-lift;
  }
  
  @include mobile {
    padding: $spacing-sm;
  }
}
```

## 🧩 컴포넌트 개발 가이드

### Atomic Design Pattern

- **Atoms**: Button, Input, Icon 등 기본 요소
- **Molecules**: SearchBar, FormField 등 복합 요소
- **Organisms**: DataGrid, Navigation 등 복잡한 구성 요소
- **Templates**: Layout, PageTemplate 등 페이지 구조

### 컴포넌트 구조

```
Button/
├── Button.tsx           # 메인 컴포넌트
├── Button.module.scss   # 스타일
├── Button.types.ts      # 타입 정의
├── Button.test.tsx      # 테스트
├── Button.stories.tsx   # 스토리북
└── index.ts            # Export
```

### AG-Grid 사용

데이터 그리드는 `BaseDataGrid` 컴포넌트를 사용합니다.

```typescript
import { BaseDataGrid } from '@shared/components/organisms/BaseDataGrid';

const columns = [
  { headerName: '이름', field: 'name', width: 150 },
  { headerName: '이메일', field: 'email', width: 200 },
];

<BaseDataGrid
  columns={columns}
  data={users}
  theme="ems"
  pagination={true}
  pageSize={25}
  onRowSelected={handleRowSelected}
/>
```

## 🔧 개발 규칙

### 필수 사항
- ✅ 모든 스타일은 CSS Modules + SCSS 사용
- ✅ TypeScript 타입 정의 필수
- ✅ 기존 공통 컴포넌트 우선 활용
- ✅ AG-Grid는 BaseDataGrid 사용

### 금지 사항
- ❌ 인라인 스타일 (`style={{}}`) 사용 금지
- ❌ CSS-in-JS 라이브러리 사용 금지
- ❌ `any` 타입 사용 지양
- ❌ 직접 AgGridReact 사용 금지

## 🧪 테스트

### 테스트 작성

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 배포

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 환경별 설정

- **Development**: `.env.development`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

## 📚 추가 문서

- [아키텍처 가이드](../EMS_FRONTEND_ARCHITECTURE.md)
- [컴포넌트 예제](../COMPONENT_EXAMPLES.md)
- [AG-Grid 가이드](../AG_GRID_INTEGRATION_GUIDE.md)
- [개발 베스트 프랙티스](../BEST_PRACTICES.md)

## 🤝 기여하기

1. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
3. 브랜치 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.