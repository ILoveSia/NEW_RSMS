# 🏗️ RSMS Frontend 아키텍처 (Claude Code 참조용)

## 📋 개요
RSMS(Resp Management System) Frontend는 Domain-Driven Design 패턴을 기반으로 한 React 18 + TypeScript + Vite 애플리케이션입니다.

---

## 🎯 핵심 기술 스택

### Core Framework
```yaml
React: 18.3.1          # UI 라이브러리
TypeScript: 5.5.2      # 타입 안전성
Vite: 5.3.1            # 빌드 도구
```

### UI Framework
```yaml
Material-UI: 5.16.0    # 메인 UI 컴포넌트
AG-Grid: 32.0.0        # 엔터프라이즈 데이터 그리드
Recharts: 2.12.7       # 차트 라이브러리
CSS Modules + SCSS     # 스타일 캡슐화
```

### State Management
```yaml
Zustand: 4.5.2         # 경량 상태 관리
TanStack Query: 5.45.1 # 서버 상태 관리
React Hook Form: 7.52.0 # 폼 관리
```

### Internationalization
```yaml
React i18next: 13.5.0   # 다국어 지원
i18next: 23.11.5        # 국제화 프레임워크
```

---

## 🏢 폴더 구조 (Domain-Driven Design)

```
src/
├── domains/                    # 🏢 비즈니스 도메인
│   ├── auth/                   # 인증/인가
│   ├── users/                  # 사용자 관리
│   ├── resps/                  # 책무 관리 (핵심 도메인)
│   ├── reports/                # 보고서
│   ├── dashboard/              # 대시보드
│   └── settings/               # 설정 관리
│   
│   └── [domain]/               # 각 도메인 구조
│       ├── api/                # API 클라이언트
│       ├── components/         # 도메인 전용 컴포넌트
│       ├── pages/              # 페이지 컴포넌트
│       ├── hooks/              # 도메인 전용 훅
│       ├── store/              # 도메인 상태 관리
│       ├── types/              # 도메인 타입
│       └── index.ts            # 도메인 공개 API
│
├── shared/                     # 🎨 공통 리소스
│   ├── components/             # Atomic Design Pattern
│   │   ├── atoms/              # Button, Input, Typography
│   │   ├── molecules/          # SearchBar, FormField, DatePicker
│   │   ├── organisms/          # BaseDataGrid, Navigation, Chart, Modal
│   │   └── templates/          # Layout, ListPageTemplate
│   ├── hooks/                  # useLocalStorage, useDebounce, useApi
│   ├── utils/                  # date, format, validation, storage
│   └── types/                  # common, api, components
│
├── app/                        # 🚀 애플리케이션 설정
│   ├── router/                 # AppRouter, routes, guards
│   ├── store/                  # rootStore, authStore, uiStore
│   └── config/                 # env, api, theme, i18n, constants
│
├── styles/                     # 🎨 전역 스타일
│   ├── _variables.scss         # SCSS 변수
│   ├── _mixins.scss            # SCSS 믹스인
│   ├── _globals.scss           # 전역 스타일
│   ├── _themes.scss            # 테마 스타일
│   └── _ag-grid.scss           # AG-Grid 테마
│
└── assets/                     # 📦 정적 자원
```

---

## 🧩 Atomic Design Pattern

### Atoms (원자)
```typescript
// shared/components/atoms/Button/Button.tsx
interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
}
```

### Molecules (분자)
```typescript
// shared/components/molecules/SearchBar/SearchBar.tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
}
```

### Organisms (유기체)
```typescript
// shared/components/organisms/BaseDataGrid/BaseDataGrid.tsx
interface BaseDataGridProps<T> {
  data: T[];
  columns: ColDef<T>[];
  loading?: boolean;
  pagination?: boolean;
  onRowClick?: (row: T) => void;
}
```

### Templates (템플릿)
```typescript
// shared/components/templates/ListPageTemplate/ListPageTemplate.tsx
interface ListPageTemplateProps {
  title: string;
  subtitle?: string;
  searchBar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

---

## 🎨 스타일 시스템

### SCSS 변수 시스템
```scss
// styles/_variables.scss
// 색상 시스템
$color-primary: #1976d2;
$color-secondary: #dc004e;
$color-success: #2e7d32;
$color-warning: #ed6c02;
$color-error: #d32f2f;

// 간격 시스템
$spacing-xs: 4px;    // 4px
$spacing-sm: 8px;    // 8px
$spacing-md: 16px;   // 16px
$spacing-lg: 24px;   // 24px
$spacing-xl: 32px;   // 32px

// 브레이크포인트
$breakpoint-mobile: 576px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;

// AG-Grid 테마 통합
$ag-foreground-color: $color-text-primary;
$ag-background-color: $color-background-default;
```

### SCSS 믹스인
```scss
// styles/_mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin responsive-breakpoint($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin card-shadow {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## 🔄 상태 관리

### Zustand (전역 상태)
```typescript
// app/store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### TanStack Query (서버 상태)
```typescript
// domains/users/hooks/useUsers.ts
export const useUsers = (params: UserQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
```

---

## 🌐 국제화 (i18n)

### 설정
```typescript
// app/config/i18n.ts
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ko',
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });
```

### 네임스페이스 구조
```
public/locales/
├── ko/
│   ├── common.json    # 공통 번역
│   ├── auth.json      # 인증 도메인
│   ├── users.json     # 사용자 도메인
│   └── resps.json     # 책무 도메인
└── en/
    ├── common.json
    ├── auth.json
    ├── users.json
    └── resps.json
```

---

## 📊 차트 시스템 (Recharts)

### 기본 차트 컴포넌트
```typescript
// shared/components/organisms/Chart/Chart.tsx
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  height?: number;
  colors?: string[];
}
```

### 도메인별 특화 차트
```typescript
// domains/resps/components/RespTrendChart.tsx
const RespTrendChart: React.FC<RespTrendChartProps> = ({ respData }) => {
  const chartData = useMemo(() => 
    transformRespDataForChart(respData), [respData]
  );
  
  return (
    <Chart
      type="line"
      data={chartData}
      config={RESP_CHART_CONFIG}
    />
  );
};
```

---

## 📈 성능 최적화

### 1. 코드 분할
```typescript
// 도메인별 지연 로딩
const AuthPages = React.lazy(() => import('@/domains/auth/pages'));
const UserPages = React.lazy(() => import('@/domains/users/pages'));
```

### 2. 메모이제이션
```typescript
// 무거운 계산 메모이제이션
const expensiveValue = useMemo(() => 
  computeExpensiveValue(data), [data]
);

// 컴포넌트 메모이제이션
const OptimizedComponent = React.memo(Component);
```

### 3. Virtual Scrolling (AG-Grid)
```typescript
// 대용량 데이터 처리
const gridOptions = {
  rowModelType: 'infinite',
  cacheBlockSize: 100,
  maxBlocksInCache: 10,
};
```

---

## 🔒 보안 고려사항

### 1. XSS 방지
```typescript
// 사용자 입력 검증
const sanitizedInput = DOMPurify.sanitize(userInput);
```

### 2. 타입 안전성
```typescript
// 강타입 시스템 활용
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### 3. 환경 변수 보안
```typescript
// 민감한 정보는 서버에서만 사용
const API_KEY = import.meta.env.VITE_API_KEY; // 클라이언트용만
```

---

## 🧪 테스트 전략

### 단위 테스트 (Vitest)
```typescript
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
```

### E2E 테스트 (Playwright)
```typescript
test('user can login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'user@example.com');
  await page.click('[data-testid=login-button]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 📚 Storybook 문서화

```typescript
// Button.stories.tsx
export default {
  title: 'Components/Atoms/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

---

## 🚀 빌드 및 배포

### 환경별 설정
```typescript
const API_BASE_URL = {
  development: 'http://localhost:8080',
  staging: 'https://staging-api.rsms.com',
  production: 'https://api.rsms.com',
}[import.meta.env.MODE];
```

---

**📅 작성일**: 2025-09-08  
**✍️ 작성자**: Claude AI (Claude Code 참조용 통합 문서)  
**🔄 버전**: 1.0.0