# 🏗️ RSMS Frontend 아키텍처 설계서 (통합 최적화 버전)

## 📋 개요

RSMS(Resp Management System) Frontend는 Domain-Driven Design 패턴을 기반으로 한 React 18 + TypeScript + Vite 애플리케이션입니다. CSS Modules + SCSS를 활용한 완전히 분리된 스타일 시스템과 재사용 가능한 컴포넌트 구조를 제공합니다.

---

## 🎯 핵심 설계 원칙

### 1. Domain-Driven Design (DDD)
- 비즈니스 도메인 중심의 폴더 구조
- 각 도메인은 독립적이며 응집도 높은 모듈
- 도메인간 의존성 최소화

### 2. 관심사 분리 (Separation of Concerns)
- 비즈니스 로직과 UI 분리
- 스타일과 컴포넌트 완전 분리
- 상태 관리와 컴포넌트 분리

### 3. 재사용성과 확장성
- Atomic Design Pattern 적용
- 공통 컴포넌트의 높은 재사용성
- 새로운 도메인 추가 시 구조적 일관성

### 4. 성능 최적화
- 코드 분할 및 지연 로딩
- 메모이제이션 활용
- Virtual Scrolling (AG-Grid)

---

## 🏢 프로젝트 구조

```
src/
├── domains/                    # 🏢 비즈니스 도메인
│   ├── auth/                   # 인증/인가 도메인
│   │   ├── api/                # API 클라이언트
│   │   │   ├── authApi.ts
│   │   │   └── types.ts
│   │   ├── components/         # 도메인 전용 컴포넌트
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.module.scss
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   ├── LoginForm.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── SignupForm/
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── hooks/              # 도메인 전용 훅
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── store/              # 도메인 상태 관리
│   │   │   ├── authStore.ts
│   │   │   └── authSelectors.ts
│   │   ├── types/              # 도메인 타입
│   │   │   ├── user.ts
│   │   │   └── auth.ts
│   │   └── index.ts            # 도메인 공개 API
│   │
│   ├── users/                  # 사용자 관리 도메인
│   ├── resps/                  # 책무 관리 도메인 (핵심)
│   ├── reports/                # 보고서 도메인
│   ├── dashboard/              # 대시보드 도메인
│   └── settings/               # 설정 관리 도메인
│
├── shared/                     # 🎨 공통 리소스
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── atoms/              # 기본 원자 컴포넌트
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.scss
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Typography/
│   │   │   ├── Checkbox/
│   │   │   └── Radio/
│   │   ├── molecules/          # 조합된 분자 컴포넌트
│   │   │   ├── SearchBar/
│   │   │   ├── FormField/
│   │   │   └── DatePicker/
│   │   ├── organisms/          # 복잡한 유기체 컴포넌트
│   │   │   ├── BaseDataGrid/   # AG-Grid 래퍼
│   │   │   ├── Navigation/
│   │   │   ├── Chart/          # Recharts 기반
│   │   │   └── Modal/
│   │   └── templates/          # 템플릿 컴포넌트
│   │       ├── Layout/
│   │       ├── ListPageTemplate/
│   │       └── DetailPageTemplate/
│   ├── hooks/                  # 공통 커스텀 훅
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useApi.ts
│   ├── utils/                  # 유틸리티 함수
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── storage.ts
│   └── types/                  # 공통 타입
│       ├── common.ts
│       ├── api.ts
│       └── components.ts
│
├── app/                        # 🚀 애플리케이션 설정
│   ├── router/                 # 라우팅 설정
│   │   ├── AppRouter.tsx
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── store/                  # 전역 상태 관리
│   │   ├── rootStore.ts        # Zustand 루트 스토어
│   │   ├── authStore.ts        # 인증 상태
│   │   └── uiStore.ts          # UI 상태
│   └── config/                 # 애플리케이션 설정
│       ├── env.ts              # 환경 변수
│       ├── api.ts              # API 클라이언트 설정
│       ├── theme.ts            # MUI 테마
│       ├── i18n.ts             # 국제화 설정
│       └── constants.ts        # 상수 정의
│
├── styles/                     # 🎨 전역 스타일
│   ├── _variables.scss         # SCSS 변수
│   ├── _mixins.scss            # SCSS 믹스인
│   ├── _globals.scss           # 전역 스타일
│   ├── _themes.scss            # 테마 스타일
│   └── _ag-grid.scss           # AG-Grid 테마
│
├── assets/                     # 📦 정적 자원
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── test/                       # 🧪 테스트 유틸리티
    ├── setup.ts
    ├── utils.ts
    └── mocks/
```

---

## 🛠️ 기술 스택

### Core Framework
- **React 18.3.1**: UI 라이브러리
- **TypeScript 5.5.2**: 타입 안전성
- **Vite 5.3.1**: 빌드 도구

### UI Framework
- **Material-UI v5.16.0**: 메인 UI 컴포넌트 라이브러리
- **AG-Grid 32.0.0**: 엔터프라이즈급 데이터 그리드
- **Recharts 2.12.7**: 차트 라이브러리
- **CSS Modules + SCSS**: 스타일 캡슐화 및 고급 스타일링

### State Management
- **Zustand 4.5.2**: 경량 상태 관리
- **TanStack Query 5.45.1**: 서버 상태 관리
- **React Hook Form 7.52.0**: 폼 관리

### Internationalization
- **React i18next 13.5.0**: 다국어 지원
- **i18next 23.11.5**: 국제화 프레임워크

### Development Tools
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Storybook 8.1.11**: 컴포넌트 문서화
- **Vitest 1.6.0**: 단위 테스트
- **Testing Library 16.0.0**: 컴포넌트 테스트
- **Playwright**: E2E 테스트

---

## 🎨 컴포넌트 아키텍처

### Atomic Design Pattern

#### 1. Atoms (원자 컴포넌트)
가장 기본적인 UI 요소, 더 이상 분해할 수 없는 컴포넌트

```typescript
// shared/components/atoms/Button/Button.tsx
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import styles from './Button.module.scss';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  loading,
  loadingText = 'Loading...',
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <MuiButton
      className={`${styles.button} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={16} className={styles.loadingIcon} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};
```

```scss
// shared/components/atoms/Button/Button.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.button {
  text-transform: none;
  border-radius: $border-radius-md;
  padding: $spacing-sm $spacing-md;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .loadingIcon {
    margin-right: $spacing-sm;
  }
}
```

#### 2. Molecules (분자 컴포넌트)
2개 이상의 원자가 결합된 간단한 UI 그룹

```typescript
// shared/components/molecules/SearchBar/SearchBar.tsx
import React, { useState } from 'react';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '@/shared/hooks';
import styles from './SearchBar.module.scss';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  loading,
  debounceMs = 300
}) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);
  
  React.useEffect(() => {
    if (debouncedValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);
  
  return (
    <Paper className={styles.searchBar}>
      <InputBase
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch(value)}
      />
      <IconButton 
        className={styles.searchButton}
        onClick={() => onSearch(value)} 
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : <SearchIcon />}
      </IconButton>
    </Paper>
  );
};
```

#### 3. Organisms (유기체 컴포넌트)
분자들이 결합된 복잡한 UI 섹션

```typescript
// shared/components/organisms/BaseDataGrid/BaseDataGrid.tsx
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import styles from './BaseDataGrid.module.scss';

export interface BaseDataGridProps<T> {
  data: T[];
  columns: ColDef<T>[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  height?: string | number;
}

export function BaseDataGrid<T>({
  data,
  columns,
  loading = false,
  pagination = true,
  pageSize = 20,
  onRowClick,
  height = 400
}: BaseDataGridProps<T>) {
  const gridOptions: GridOptions<T> = {
    columnDefs: columns,
    rowData: data,
    pagination: pagination,
    paginationPageSize: pageSize,
    onRowClicked: (event) => {
      if (onRowClick && event.data) {
        onRowClick(event.data);
      }
    },
    animateRows: true,
    rowSelection: 'single',
  };
  
  return (
    <div className={`${styles.gridContainer} ag-theme-material`} style={{ height }}>
      {loading && <div className={styles.loadingOverlay}>Loading...</div>}
      <AgGridReact {...gridOptions} />
    </div>
  );
}
```

#### 4. Templates (템플릿 컴포넌트)
페이지의 레이아웃을 정의하는 구조

```typescript
// shared/components/templates/ListPageTemplate/ListPageTemplate.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import styles from './ListPageTemplate.module.scss';

export interface ListPageTemplateProps {
  title: string;
  subtitle?: string;
  searchBar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  subtitle,
  searchBar,
  filters,
  actions,
  children
}) => {
  return (
    <Box className={styles.pageContainer}>
      {/* 페이지 헤더 */}
      <Paper className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <Typography variant="h4" component="h1">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </Paper>

      {/* 필터 영역 */}
      {(searchBar || filters) && (
        <Paper className={styles.filterSection}>
          {searchBar && <div className={styles.searchBar}>{searchBar}</div>}
          {filters && <div className={styles.filters}>{filters}</div>}
        </Paper>
      )}

      {/* 컨텐츠 영역 */}
      <Paper className={styles.contentSection}>
        {children}
      </Paper>
    </Box>
  );
};
```

---

## 🎨 스타일 시스템

### SCSS 변수 시스템

```scss
// styles/_variables.scss
// ============================================
// 색상 시스템
// ============================================
// Primary Colors
$color-primary: #1976d2;
$color-primary-light: #42a5f5;
$color-primary-dark: #1565c0;

// Secondary Colors
$color-secondary: #dc004e;
$color-secondary-light: #f05545;
$color-secondary-dark: #9a0036;

// Status Colors
$color-success: #2e7d32;
$color-warning: #ed6c02;
$color-error: #d32f2f;
$color-info: #0288d1;

// Text Colors
$color-text-primary: rgba(0, 0, 0, 0.87);
$color-text-secondary: rgba(0, 0, 0, 0.6);
$color-text-disabled: rgba(0, 0, 0, 0.38);

// Background Colors
$color-background-default: #f5f5f5;
$color-background-paper: #ffffff;
$color-background-hover: rgba(0, 0, 0, 0.04);

// ============================================
// 간격 시스템
// ============================================
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

// ============================================
// 타이포그래피
// ============================================
$font-family-base: 'Pretendard', 'Roboto', 'Helvetica', 'Arial', sans-serif;
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-xxl: 1.5rem;    // 24px

// ============================================
// 브레이크포인트
// ============================================
$breakpoint-mobile: 576px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-wide: 1440px;

// ============================================
// 기타 스타일 속성
// ============================================
$border-radius-sm: 2px;
$border-radius-md: 4px;
$border-radius-lg: 8px;
$border-radius-xl: 16px;

$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
$shadow-md: 0 2px 4px rgba(0, 0, 0, 0.15);
$shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.18);
$shadow-xl: 0 8px 12px rgba(0, 0, 0, 0.20);

// ============================================
// AG-Grid 테마 변수
// ============================================
$ag-foreground-color: $color-text-primary;
$ag-background-color: $color-background-default;
$ag-header-foreground-color: $color-text-secondary;
$ag-header-background-color: $color-background-paper;
$ag-row-hover-color: $color-background-hover;
$ag-selected-row-background-color: rgba($color-primary, 0.1);
```

### SCSS 믹스인

```scss
// styles/_mixins.scss
// ============================================
// 레이아웃 믹스인
// ============================================
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

@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// ============================================
// 반응형 믹스인
// ============================================
@mixin responsive-breakpoint($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin mobile {
  @media (max-width: #{$breakpoint-mobile - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: $breakpoint-mobile) and (max-width: #{$breakpoint-tablet - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: $breakpoint-desktop) {
    @content;
  }
}

// ============================================
// 스타일 효과 믹스인
// ============================================
@mixin card-shadow {
  box-shadow: $shadow-md;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: $shadow-lg;
  }
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin scrollbar-style {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-background-default;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-text-disabled;
    border-radius: $border-radius-sm;
    
    &:hover {
      background: $color-text-secondary;
    }
  }
}
```

---

## 🔄 상태 관리 아키텍처

### Zustand를 활용한 상태 관리

```typescript
// app/store/rootStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthState, createAuthSlice } from './authSlice';
import { UIState, createUISlice } from './uiSlice';

export interface RootState {
  auth: AuthState;
  ui: UIState;
}

export const useStore = create<RootState>()(
  devtools(
    persist(
      (set, get) => ({
        auth: createAuthSlice(set, get),
        ui: createUISlice(set, get),
      }),
      {
        name: 'rsms-store',
        partialize: (state) => ({
          auth: {
            user: state.auth.user,
            isAuthenticated: state.auth.isAuthenticated,
          },
        }),
      }
    )
  )
);
```

### TanStack Query를 활용한 서버 상태

```typescript
// domains/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import type { User, UserQueryParams } from '../types';

export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

---

## 🌐 국제화 (i18n) 아키텍처

### React i18next 설정

```typescript
// app/config/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ko',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    ns: ['common', 'auth', 'users', 'resps', 'reports'],
    defaultNS: 'common',
  });

export default i18n;
```

### 네임스페이스 구조

```
public/locales/
├── ko/
│   ├── common.json          # 공통 번역
│   ├── auth.json            # 인증 도메인
│   ├── users.json           # 사용자 도메인
│   ├── resps.json           # 책무 도메인
│   └── reports.json         # 보고서 도메인
└── en/
    ├── common.json
    ├── auth.json
    ├── users.json
    ├── resps.json
    └── reports.json
```

### 컴포넌트에서 사용

```typescript
// domains/users/pages/UserListPage.tsx
import { useTranslation } from 'react-i18next';

export const UserListPage: React.FC = () => {
  const { t } = useTranslation('users');
  
  return (
    <ListPageTemplate
      title={t('list.title')}
      subtitle={t('list.subtitle')}
    >
      {/* ... */}
    </ListPageTemplate>
  );
};
```

---

## 📊 차트 시스템 아키텍처

### Recharts 기반 차트 컴포넌트

```typescript
// shared/components/organisms/Chart/Chart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export type ChartType = 'line' | 'bar' | 'pie' | 'area';

export interface ChartProps {
  type: ChartType;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  colors?: string[];
}

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  colors = ['#1976d2', '#dc004e', '#2e7d32'],
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={colors[0]}
              label
            />
            <Tooltip />
          </PieChart>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};
```

---

## 🧪 테스트 아키텍처

### 테스트 전략

#### 1. 단위 테스트 (Vitest)

```typescript
// shared/components/atoms/Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('shows loading state', () => {
    render(<Button loading loadingText="Loading...">Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### 2. 컴포넌트 테스트 (Testing Library)

```typescript
// domains/users/pages/UserListPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserListPage } from './UserListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('UserListPage', () => {
  it('displays user list after loading', async () => {
    render(<UserListPage />, { wrapper });
    
    // 로딩 상태 확인
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // 데이터 로드 후 확인
    await waitFor(() => {
      expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    });
  });
});
```

#### 3. 통합 테스트 (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 폼 입력
    await page.fill('[data-testid=email]', 'user@example.com');
    await page.fill('[data-testid=password]', 'password123');
    
    // 로그인 버튼 클릭
    await page.click('[data-testid=login-button]');
    
    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('대시보드');
  });
  
  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid=email]', 'wrong@example.com');
    await page.fill('[data-testid=password]', 'wrongpassword');
    await page.click('[data-testid=login-button]');
    
    // 에러 메시지 확인
    await expect(page.locator('[role=alert]')).toContainText('Invalid credentials');
  });
});
```

---

## 📚 Storybook 컴포넌트 문서화

```typescript
// shared/components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'contained',
    color: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Submit',
    loading: true,
    loadingText: 'Submitting...',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
};
```

---

## 📈 성능 최적화 전략

### 1. 코드 분할 (Code Splitting)

```typescript
// app/router/routes.ts
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/components';

// 도메인별 지연 로딩
const AuthPages = lazy(() => import('@/domains/auth/pages'));
const UserPages = lazy(() => import('@/domains/users/pages'));
const RespPages = lazy(() => import('@/domains/resps/pages'));
const ReportPages = lazy(() => import('@/domains/reports/pages'));
const DashboardPages = lazy(() => import('@/domains/dashboard/pages'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/auth/*" element={<AuthPages />} />
        <Route path="/users/*" element={<UserPages />} />
        <Route path="/resps/*" element={<RespPages />} />
        <Route path="/reports/*" element={<ReportPages />} />
        <Route path="/dashboard/*" element={<DashboardPages />} />
      </Routes>
    </Suspense>
  );
};
```

### 2. 메모이제이션

```typescript
// 컴포넌트 메모이제이션
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // 복잡한 렌더링 로직
  return <div>{/* ... */}</div>;
}, (prevProps, nextProps) => {
  // 커스텀 비교 로직
  return prevProps.data.id === nextProps.data.id;
});

// 값 메모이제이션
const ExpensiveCalculation: React.FC<{ data: any[] }> = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => {
      // 복잡한 데이터 처리
      return processItem(item);
    });
  }, [data]);
  
  return <Chart data={processedData} />;
};

// 콜백 메모이제이션
const SearchableList: React.FC = () => {
  const [query, setQuery] = useState('');
  
  const handleSearch = useCallback((searchQuery: string) => {
    // API 호출 또는 필터링 로직
    performSearch(searchQuery);
  }, []);
  
  return <SearchBar onSearch={handleSearch} />;
};
```

### 3. Virtual Scrolling (AG-Grid)

```typescript
// shared/components/organisms/BaseDataGrid/BaseDataGrid.tsx
const gridOptions: GridOptions = {
  // 가상 스크롤링 설정
  rowModelType: 'infinite',
  cacheBlockSize: 100,
  maxBlocksInCache: 10,
  
  // 성능 최적화 옵션
  animateRows: false,
  suppressColumnVirtualisation: false,
  suppressRowHoverHighlight: false,
  
  // 대용량 데이터 처리
  datasource: {
    getRows: async (params) => {
      const response = await fetchData(params.startRow, params.endRow);
      params.successCallback(response.data, response.totalCount);
    },
  },
};
```

### 4. 번들 최적화

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: 'treemap',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material'],
          'grid-vendor': ['ag-grid-react', 'ag-grid-community'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['axios', 'date-fns', 'lodash-es'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

## 🔒 보안 고려사항

### 1. XSS 방지

```typescript
// utils/security.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
};

// 사용 예시
const UserContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHtml(content) 
      }} 
    />
  );
};
```

### 2. 타입 안전성

```typescript
// 강타입 시스템 활용
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

// 타입 가드
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

// Zod를 활용한 런타임 타입 검증
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user', 'guest']),
});

type User = z.infer<typeof UserSchema>;

export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};
```

### 3. 환경 변수 보안

```typescript
// app/config/env.ts
const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PUBLIC_KEY: import.meta.env.VITE_PUBLIC_KEY,
  // 민감한 정보는 서버에서만 사용
  // SECRET_KEY는 클라이언트에 노출되지 않음
} as const;

// 환경 변수 검증
if (!ENV.API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required');
}

export default ENV;
```

---

## 🚀 빌드 및 배포

### 빌드 설정

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,scss}\"",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### 환경별 설정

```typescript
// app/config/env.ts
const getApiBaseUrl = () => {
  switch (import.meta.env.MODE) {
    case 'development':
      return 'http://localhost:8080/api';
    case 'staging':
      return 'https://staging-api.rsms.com';
    case 'production':
      return 'https://api.rsms.com';
    default:
      return 'http://localhost:8080/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();
```

### Docker 설정

```dockerfile
# Dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 📊 모니터링 및 분석

### 성능 모니터링

```typescript
// utils/performance.ts
export const measurePerformance = (name: string) => {
  if ('performance' in window) {
    performance.mark(`${name}-start`);
    
    return () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration}ms`);
      
      // 분석 서비스로 전송
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name,
          value: Math.round(measure.duration),
        });
      }
    };
  }
  
  return () => {};
};
```

### 에러 트래킹

```typescript
// app/providers/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };
  
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Sentry로 에러 전송
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
  
  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div>
            <h2>오류가 발생했습니다</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }
    
    return this.props.children;
  }
}
```

---

## 🎯 개발 가이드라인

### 컴포넌트 개발 체크리스트

- [ ] TypeScript 인터페이스 정의
- [ ] Props 기본값 설정
- [ ] 스토리북 스토리 작성
- [ ] 단위 테스트 작성
- [ ] CSS Module 스타일 작성
- [ ] 접근성(a11y) 고려
- [ ] 반응형 디자인 적용
- [ ] 성능 최적화 (memo, useMemo 등)
- [ ] 에러 처리
- [ ] 로딩 상태 처리

### 코드 리뷰 체크리스트

- [ ] 타입 안전성 확인
- [ ] 네이밍 컨벤션 준수
- [ ] 중복 코드 제거
- [ ] 성능 최적화 필요성 검토
- [ ] 접근성 요구사항 충족
- [ ] 테스트 커버리지 확인
- [ ] 보안 취약점 검토
- [ ] 문서화 완성도

---

## 📚 참고 문서

- [React 18 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Material-UI 문서](https://mui.com/)
- [AG-Grid React 문서](https://ag-grid.com/react-data-grid/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [TanStack Query 문서](https://tanstack.com/query)
- [React Hook Form 문서](https://react-hook-form.com/)
- [Recharts 문서](https://recharts.org/)
- [React i18next 문서](https://react.i18next.com/)
- [Vite 문서](https://vitejs.dev/)
- [Storybook 문서](https://storybook.js.org/)
- [Vitest 문서](https://vitest.dev/)
- [Playwright 문서](https://playwright.dev/)

---

**📅 작성일**: 2025-09-08  
**✍️ 작성자**: Claude AI (RSMS Frontend 아키텍처 통합 최적화 문서)  
**🔄 버전**: 1.0.0 (통합 최적화 버전)