# 🎯 RSMS Frontend 개발 가이드 (Claude Code 참조용)

## 📋 개요
이 문서는 Claude Code가 RSMS Frontend 개발 시 반드시 참조해야 할 핵심 개발 가이드입니다.

---

## 🚨 절대 하지 말아야 할 것들 (NEVER DO)

### 스타일링 금지사항
```typescript
// ❌ 절대 금지 - 인라인 스타일
<div style={{ padding: '10px' }}>
<Box sx={{ margin: 2 }}>

// ✅ 반드시 이렇게 - CSS Modules
import styles from './Component.module.scss';
<div className={styles.container}>
```

### 타입 안전성 금지사항
```typescript
// ❌ 절대 금지 - any 타입
const handleData = (data: any) => {}

// ✅ 반드시 이렇게 - 명확한 타입
const handleData = (data: UserData | unknown) => {}
```

### 컴포넌트 개발 금지사항
- ❌ 기존 shared/components 무시하고 새로 만들기
- ❌ TypeScript 인터페이스 없는 컴포넌트
- ❌ CSS Module 없이 컴포넌트 개발
- ❌ Material-UI Button 직접 사용 (테마 시스템 미적용)

### 테마 시스템 금지사항
```typescript
// ❌ 절대 금지 - Material-UI Button 직접 사용
import { Button } from '@mui/material';

// ❌ 절대 금지 - 고정 색상 스타일 !important 사용
.actionButton {
  background: #ff9900 !important;
  color: white !important;
}

// ✅ 반드시 이렇게 - 테마 적용 Button 사용
import { Button } from '@/shared/components/atoms/Button';

// ✅ 반드시 이렇게 - 테마 변수 사용
.actionButton {
  background: var(--theme-button-primary) !important;
  color: var(--theme-button-primary-text) !important;
}
```

---

## ✅ 핵심 개발 원칙

### 1. Domain-Driven Design 구조
```
src/domains/
├── auth/           # 인증/인가 도메인
├── users/          # 사용자 관리 도메인
├── resps/          # 책무 관리 도메인 (핵심)
├── reports/        # 보고서 도메인
├── dashboard/      # 대시보드 도메인
└── settings/       # 설정 도메인

각 도메인별 구조:
├── api/            # API 클라이언트
├── components/     # 도메인 전용 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 도메인 전용 훅
├── store/          # 도메인 상태 관리
├── types/          # 도메인 타입
└── index.ts        # 도메인 공개 API
```

### 2. Atomic Design Pattern
```
shared/components/
├── atoms/          # Button, Input, Typography
├── molecules/      # SearchBar, FormField, DatePicker
├── organisms/      # BaseDataGrid, Navigation, Chart
└── templates/      # Layout, ListPageTemplate
```

### 3. 표준 페이지 템플릿 (PositionMgmt.tsx)
**모든 새로운 페이지는 PositionMgmt.tsx 구조를 참고하여 개발**

```tsx
// 표준 페이지 구조
const PageComponent: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* 1. 페이지 헤더 (통계 카드 포함) */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>{t('page.title')}</h1>
              <p className={styles.pageDescription}>{t('page.description')}</p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>...</div>
          </div>
        </div>
      </div>

      {/* 2. 검색 필터 섹션 */}
      <div className={styles.searchSection}>
        <ComponentSearchFilter ... />
      </div>

      {/* 3. 액션 바 */}
      <div className={styles.actionBar}>
        <div className={styles.actionLeft}>...</div>
        <div className={styles.actionRight}>
          <Button variant="contained">엑셀다운로드</Button>
          <Button variant="contained">등록</Button>
          <Button variant="contained">삭제</Button>
        </div>
      </div>

      {/* 4. 데이터 그리드 */}
      <div className={styles.gridSection}>
        <ComponentDataGrid ... />
      </div>
    </div>
  );
};
```

### 4. 테마 시스템 (필수 적용)
**8가지 브랜드 테마를 지원하는 동적 테마 시스템**

```typescript
// 테마 적용 Button 사용 (필수)
import { Button } from '@/shared/components/atoms/Button';

// 테마 변수 CSS 사용
.actionButton {
  background: var(--theme-button-primary);
  color: var(--theme-button-primary-text);
  // 고정 색상 금지!
}

// 테마 스토어 사용
import { useThemeStore } from '@/app/store/themeStore';
const { currentTheme, setTheme } = useThemeStore();
```

**지원 테마 목록:**
- 🎨 기본 스타일 (슬레이트 그레이)
- 🎬 넷플릭스 스타일 (다크 + 레드)
- 📦 아마존 스타일 (오렌지) - 기본값
- 📷 인스타그램 스타일 (그라데이션)
- 🏢 맨하탄 금융센터 스타일 (금융 블루)
- 💬 WhatsApp 스타일 (그린)
- 🍎 애플 스타일 (미니멀 블루)
- 🔍 구글 스타일 (클린 모던)

### 5. CSS Modules + SCSS 스타일링
```scss
// Component.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.container {
  padding: $spacing-md;           // 16px
  background: $color-primary;     // #1976d2
  border-radius: $border-radius-md; // 4px
  
  @include flex-center;           // 믹스인 활용
  @include responsive-breakpoint($breakpoint-tablet) {
    padding: $spacing-lg;         // 24px
  }
}
```

---

## 🎨 UI 컴포넌트 개발 가이드

### Button 컴포넌트 예시
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

.button {
  text-transform: none;
  border-radius: $border-radius-md;
  padding: $spacing-sm $spacing-md;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  
  .loadingIcon {
    margin-right: $spacing-sm;
  }
}
```

### SearchBar 컴포넌트 예시
```typescript
// shared/components/molecules/SearchBar/SearchBar.tsx
import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
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
  loading = false,
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
      />
      <IconButton 
        className={styles.searchButton}
        onClick={() => onSearch(value)}
        disabled={loading}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};
```

---

## 📊 AG-Grid 사용 가이드

### BaseDataGrid 컴포넌트
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

### AG-Grid 테마 커스터마이징
```scss
// styles/_ag-grid.scss
.ag-theme-material {
  --ag-foreground-color: #{$color-text-primary};
  --ag-background-color: #{$color-background-default};
  --ag-header-foreground-color: #{$color-text-secondary};
  --ag-header-background-color: #{$color-background-paper};
  --ag-row-hover-color: #{$color-background-hover};
  --ag-selected-row-background-color: #{rgba($color-primary, 0.1)};
}
```

---

## 📊 Recharts 차트 사용 가이드

### Chart 컴포넌트
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

export type ChartType = 'line' | 'bar' | 'pie';

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
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
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

### 도메인별 차트 활용
```typescript
// domains/resps/components/RespTrendChart.tsx
import { Chart } from '@/shared/components/organisms/Chart';

const RespTrendChart: React.FC<{ respData: RespData[] }> = ({ respData }) => {
  const chartData = useMemo(() => 
    transformRespDataForChart(respData), [respData]
  );
  
  return (
    <Chart
      type="line"
      data={chartData}
      dataKey="score"
      xAxisKey="date"
      height={400}
      colors={['#1976d2', '#dc004e']}
    />
  );
};
```

---

## 🌐 국제화 (i18n) 사용 가이드

### 설정 및 구조
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

### 컴포넌트에서 사용
```typescript
// domains/users/pages/UserListPage.tsx
import { useTranslation } from 'react-i18next';

export const UserListPage: React.FC = () => {
  const { t } = useTranslation('users'); // 네임스페이스 지정
  
  return (
    <ListPageTemplate
      title={t('list.title')}           // "사용자 목록"
      subtitle={t('list.subtitle')}     // "시스템 사용자를 관리합니다"
    >
      <Button>{t('actions.create')}</Button> {/* "사용자 생성" */}
    </ListPageTemplate>
  );
};
```

### 번역 파일 예시
```json
// public/locales/ko/users.json
{
  "list": {
    "title": "사용자 목록",
    "subtitle": "시스템 사용자를 관리합니다"
  },
  "actions": {
    "create": "사용자 생성",
    "edit": "수정",
    "delete": "삭제"
  },
  "validation": {
    "email_required": "이메일은 필수입니다",
    "password_min_length": "비밀번호는 최소 8자리입니다"
  }
}
```

---

## 🔄 상태 관리 패턴

### Zustand 전역 상태
```typescript
// app/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, token) => 
        set({ user, isAuthenticated: true }),
      logout: () => 
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'rsms-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### TanStack Query 서버 상태
```typescript
// domains/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

## 📝 코딩 스타일 가이드

### 네이밍 컨벤션
```typescript
// 컴포넌트: PascalCase
export const UserProfile = () => {}

// 함수/변수: camelCase  
const getUserData = () => {}
const isLoading = true

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.rsms.com'

// 파일명: PascalCase (컴포넌트), camelCase (유틸)
// UserProfile.tsx, dateUtils.ts
```

### 타입 정의 규칙
```typescript
// Props 타입 명시
interface ComponentProps {
  id: string;
  name: string;
  onUpdate: (data: UpdateData) => void;
}

// API 응답 타입
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// unknown 타입과 타입 가드
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}
```

### 컴포넌트 구조 패턴
```typescript
// ✅ 올바른 컴포넌트 구조
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/atoms/Button';
import styles from './UserProfile.module.scss';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUpdate 
}) => {
  const { t } = useTranslation('users');
  const { user, loading, error } = useUser(userId);
  
  const handleUpdate = useCallback((data: UpdateData) => {
    // 업데이트 로직
    onUpdate?.(updatedUser);
  }, [onUpdate]);
  
  const processedData = useMemo(() => 
    processUserData(user), [user]
  );
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={styles.container}>
      <h1>{t('profile.title', { name: user.name })}</h1>
      <Button onClick={() => handleUpdate(data)}>
        {t('actions.update')}
      </Button>
    </div>
  );
};

export default UserProfile;
```

---

## 🧪 테스트 작성 가이드

### 컴포넌트 테스트
```typescript
// UserProfile.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    render(<UserProfile userId="1" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('calls onUpdate when update button is clicked', () => {
    const mockOnUpdate = vi.fn();
    render(<UserProfile userId="1" onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Update'));
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.any(Object));
  });
  
  it('shows loading state initially', () => {
    render(<UserProfile userId="1" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### 커스텀 훅 테스트
```typescript
// useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(expect.any(Array));
  });
});
```

---

## 📚 Storybook 문서화

### 컴포넌트 스토리
```typescript
// Button.stories.tsx
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

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};
```

---

## 🚀 성능 최적화 가이드

### React.memo 활용
```typescript
// 무거운 컴포넌트 메모이제이션
export const ExpensiveComponent = React.memo(({ data, onUpdate }: Props) => {
  // 복잡한 렌더링 로직
  return <ComplexUI data={data} onUpdate={onUpdate} />;
}, (prevProps, nextProps) => {
  // 커스텀 비교 로직
  return prevProps.data.id === nextProps.data.id;
});
```

### useMemo, useCallback 활용
```typescript
const ComponentWithOptimization: React.FC<Props> = ({ data, onUpdate }) => {
  // 무거운 계산 메모이제이션
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  // 콜백 메모이제이션
  const handleUpdate = useCallback((newData: Data) => {
    onUpdate(newData);
  }, [onUpdate]);
  
  // 필터링된 데이터 메모이제이션
  const filteredData = useMemo(() => {
    return data.filter(item => item.isActive);
  }, [data]);
  
  return <OptimizedUI data={processedData} onUpdate={handleUpdate} />;
};
```

### 코드 분할
```typescript
// 페이지 레벨 코드 분할
const AuthPages = React.lazy(() => import('@/domains/auth/pages'));
const UserPages = React.lazy(() => import('@/domains/users/pages'));

// 컴포넌트 레벨 코드 분할
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// 사용
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart data={chartData} />
</Suspense>
```

---

## 🔧 개발 워크플로우

### 1. 개발 시작 전 체크리스트
- [ ] FRONTEND_ARCHITECTURE.md 도메인 구조 확인
- [ ] 기존 shared/components 재사용 가능성 확인
- [ ] styles/_variables.scss, _mixins.scss 변수 확인
- [ ] 관련 도메인의 기존 컴포넌트 패턴 확인

### 2. 컴포넌트 개발 프로세스
```bash
1. 적절한 Atomic Design 레벨 결정
2. TypeScript 인터페이스 정의
3. 컴포넌트 로직 구현 (.tsx)
4. SCSS 모듈 스타일 구현 (.module.scss)
5. 테스트 구현 (.test.tsx)
6. 스토리북 구현 (.stories.tsx)
7. index.ts export 추가
```

### 3. 도메인 기능 개발 프로세스
```bash
1. 도메인 결정 (auth, users, resps, reports, dashboard, settings)
2. API 타입 정의 (domains/[domain]/types/)
3. 컴포넌트 구현 (domains/[domain]/components/)
4. 페이지 구현 (domains/[domain]/pages/)
5. 훅 구현 (domains/[domain]/hooks/)
6. 상태 관리 (domains/[domain]/store/ 또는 app/store/)
7. 라우팅 추가 (app/router/)
```

### 4. 코드 검증
```bash
# 린트 검사
npm run lint:check

# 타입 검사  
npm run type-check

# 테스트 실행
npm run test

# 빌드 확인
npm run build
```

---

## 🔍 코드 리뷰 체크리스트

### 필수 확인 사항
- [ ] 인라인 스타일 사용 여부 (절대 금지)
- [ ] any 타입 사용 여부 (절대 금지)
- [ ] 기존 공통 컴포넌트 재사용 여부
- [ ] CSS Module + SCSS 스타일링 적용
- [ ] TypeScript 인터페이스 정의
- [ ] 국제화(i18n) 적용 여부
- [ ] 성능 최적화 (memo, useMemo 등) 필요성
- [ ] 테스트 코드 작성 여부

### 아키텍처 확인 사항
- [ ] Domain-Driven Design 구조 준수
- [ ] Atomic Design Pattern 레벨 적절성
- [ ] **PositionMgmt.tsx 표준 템플릿 구조 준수** (신규 페이지)
- [ ] **테마 시스템 적용** (Button 컴포넌트, CSS 변수 사용)
- [ ] 컴포넌트 재사용성 고려
- [ ] 상태 관리 적절성 (Zustand vs TanStack Query)

### 테마 시스템 확인 사항
- [ ] Material-UI Button 직접 사용 금지 확인
- [ ] `@/shared/components/atoms/Button` 사용 확인
- [ ] CSS 변수 (`var(--theme-button-primary)`) 사용 확인
- [ ] 고정 색상 `!important` 사용 금지 확인
- [ ] 8가지 테마에서 정상 작동 확인

---

**📅 작성일**: 2025-09-08
**📅 마지막 업데이트**: 2025-09-17 (테마 시스템 및 표준 템플릿 추가)
**✍️ 작성자**: Claude AI (Claude Code 참조용 통합 문서)  
**🔄 버전**: 1.0.0