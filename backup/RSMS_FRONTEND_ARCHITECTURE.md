# RSMS Frontend 아키텍처 설계서

## 📋 개요
RSMS(Resp Management System) 프론트엔드를 공통 컴포넌트 기반의 모듈화된 구조로 재구축합니다.

## 🎯 핵심 목표
1. **재사용성 극대화**: 공통 컴포넌트 라이브러리 구축
2. **일관성 유지**: 디자인 시스템 기반 UI/UX
3. **개발 생산성 향상**: 업무 화면 템플릿화
4. **유지보수성 강화**: 명확한 모듈 구조

## 🏗️ 기술 스택

### Core
- **React 18.3**: UI 라이브러리
- **TypeScript 5.x**: 타입 안전성
- **Vite 5.x**: 빌드 도구

### UI Framework
- **Material-UI v5**: 메인 UI 컴포넌트 라이브러리
- **CSS Modules**: 컴포넌트별 스타일 캡슐화
- **SASS/SCSS**: 고급 CSS 기능 (변수, 믹스인, 중첩)
- **React Hook Form**: 폼 관리
- **React Table**: 테이블 컴포넌트

### State Management
- **Zustand**: 경량 상태 관리
- **TanStack Query**: 서버 상태 관리

### Development
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Storybook**: 컴포넌트 문서화
- **Jest + React Testing Library**: 테스팅

## 📁 프로젝트 구조

```
rsms-frontend/
├── src/
│   ├── shared/                 # 🎨 공통 리소스
│   │   ├── components/         # 공통 UI 컴포넌트
│   │   │   ├── atoms/         # 기본 컴포넌트 (Button, Input, Label)
│   │   │   ├── molecules/     # 복합 컴포넌트 (SearchBar, FormField)
│   │   │   ├── organisms/     # 복잡한 컴포넌트 (DataTable, Form)
│   │   │   ├── templates/     # 페이지 템플릿 (ListPage, DetailPage)
│   │   │   └── index.ts       # 컴포넌트 export
│   │   ├── hooks/             # 공통 커스텀 훅
│   │   ├── utils/             # 유틸리티 함수
│   │   ├── types/             # 공통 타입 정의
│   │   ├── constants/         # 상수 정의
│   │   └── styles/            # 글로벌 스타일, 테마
│   │       ├── globals/       # 전역 스타일
│   │       ├── variables/     # SCSS 변수
│   │       ├── mixins/        # 재사용 믹스인
│   │       └── themes/        # 테마 정의
│   │
│   ├── domains/               # 🏢 업무 도메인
│   │   ├── user/              # 사용자 관리
│   │   ├── audit/             # 감사 관리
│   │   ├── resp/              # 책무 관리
│   │   ├── approval/          # 결재 관리
│   │   └── [domain]/
│   │       ├── api/           # API 클라이언트
│   │       ├── components/    # 도메인 전용 컴포넌트
│   │       ├── pages/         # 페이지 컴포넌트
│   │       ├── hooks/         # 도메인 전용 훅
│   │       ├── store/         # 도메인 상태 관리
│   │       ├── types/         # 도메인 타입 정의
│   │       └── routes.tsx     # 도메인 라우팅
│   │
│   ├── app/                   # 🚀 애플리케이션 설정
│   │   ├── router/            # 라우팅 설정
│   │   ├── store/             # 전역 상태 관리
│   │   ├── config/            # 앱 설정
│   │   ├── providers/         # Context Providers
│   │   └── layouts/           # 레이아웃 컴포넌트
│   │
│   ├── App.tsx                # 앱 진입점
│   └── main.tsx               # 메인 진입점
│
├── public/                    # 정적 파일
├── tests/                     # 테스트 파일
└── package.json              # 프로젝트 설정
```

## 🎨 공통 컴포넌트 라이브러리

### 1. Atomic Design 패턴

#### Atoms (기본 컴포넌트)
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
@import '@/shared/styles/variables';
@import '@/shared/styles/mixins';

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

#### Molecules (복합 컴포넌트)
```typescript
// shared/components/molecules/SearchBar/SearchBar.tsx
import React from 'react';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './SearchBar.module.scss';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  loading
}) => {
  return (
    <Paper className={styles.searchBar}>
      <InputBase
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      />
      <IconButton 
        className={styles.searchButton}
        onClick={onSearch} 
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : <SearchIcon />}
      </IconButton>
    </Paper>
  );
};
```

```scss
// shared/components/molecules/SearchBar/SearchBar.module.scss
@import '@/shared/styles/variables';
@import '@/shared/styles/mixins';

.searchBar {
  @include flex-center;
  padding: $spacing-xs;
  border-radius: $border-radius-lg;
  background-color: $color-background-paper;
  box-shadow: $shadow-sm;
  
  .input {
    flex: 1;
    margin-left: $spacing-sm;
    
    input {
      font-size: $font-size-base;
      color: $color-text-primary;
      
      &::placeholder {
        color: $color-text-secondary;
      }
    }
  }
  
  .searchButton {
    padding: $spacing-sm;
    color: $color-primary;
    
    &:hover {
      background-color: $color-primary-light;
    }
    
    &:disabled {
      color: $color-text-disabled;
    }
  }
}
```

#### Organisms (복잡한 컴포넌트)
```typescript
// shared/components/organisms/DataTable/DataTable.tsx
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
  sorting?: SortingProps;
  selection?: SelectionProps;
  actions?: ActionProps[];
}

export function DataTable<T>({
  data,
  columns,
  loading,
  onRowClick,
  pagination,
  sorting,
  selection,
  actions
}: DataTableProps<T>) {
  // 테이블 로직
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {/* 헤더 렌더링 */}
        </TableHead>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : (
            data.map((row) => (
              // 데이터 렌더링
            ))
          )}
        </TableBody>
      </Table>
      {pagination && <TablePagination {...pagination} />}
    </TableContainer>
  );
}
```

#### Templates (페이지 템플릿)
```typescript
// shared/components/templates/ListPageTemplate/ListPageTemplate.tsx
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
    <Box>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <Typography variant="h4">{title}</Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        <div className={styles.actions}>{actions}</div>
      </div>

      {/* 필터 영역 */}
      {(searchBar || filters) && (
        <FilterSection>
          {searchBar}
          {filters}
        </FilterSection>
      )}

      {/* 컨텐츠 영역 */}
      <ContentSection>
        {children}
      </ContentSection>
    </Box>
  );
};
```

### 2. 컴포넌트 사용 가이드

```typescript
// 업무 화면 예시: 사용자 관리 페이지
// domains/user/pages/UserListPage.tsx
import { 
  ListPageTemplate, 
  DataTable, 
  SearchBar, 
  Button 
} from '@/shared/components';

export const UserListPage: React.FC = () => {
  const { users, loading } = useUsers();
  const [search, setSearch] = useState('');

  return (
    <ListPageTemplate
      title="사용자 관리"
      subtitle="시스템 사용자를 관리합니다"
      searchBar={
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="사용자 검색..."
        />
      }
      actions={
        <Button 
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          사용자 추가
        </Button>
      }
    >
      <DataTable
        data={users}
        columns={userColumns}
        loading={loading}
        onRowClick={handleRowClick}
        pagination={{
          page,
          rowsPerPage,
          onPageChange,
          onRowsPerPageChange
        }}
      />
    </ListPageTemplate>
  );
};
```

## 🎨 디자인 시스템 (CSS Modules + SCSS)

### SCSS 변수 정의
```scss
// shared/styles/variables/_colors.scss
// 색상 팔레트
$color-primary: #1976d2;
$color-primary-light: #42a5f5;
$color-primary-dark: #1565c0;

$color-secondary: #dc004e;
$color-secondary-light: #f05545;
$color-secondary-dark: #9a0036;

$color-success: #4caf50;
$color-warning: #ff9800;
$color-error: #f44336;
$color-info: #2196f3;

// 배경색
$color-background-default: #f5f5f5;
$color-background-paper: #ffffff;
$color-background-dark: #303030;

// 텍스트 색상
$color-text-primary: rgba(0, 0, 0, 0.87);
$color-text-secondary: rgba(0, 0, 0, 0.6);
$color-text-disabled: rgba(0, 0, 0, 0.38);
```

```scss
// shared/styles/variables/_spacing.scss
// 간격
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

// Border Radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;
$border-radius-full: 50%;
```

```scss
// shared/styles/variables/_typography.scss
// 폰트
$font-family-base: 'Pretendard', 'Roboto', 'Helvetica', 'Arial', sans-serif;
$font-family-mono: 'Fira Code', 'Monaco', monospace;

// 폰트 크기
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
$font-size-xxl: 1.5rem;   // 24px

// 폰트 굵기
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

```scss
// shared/styles/variables/_shadows.scss
// 그림자
$shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
$shadow-md: 0 3px 6px rgba(0, 0, 0, 0.16);
$shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.19);
$shadow-xl: 0 15px 30px rgba(0, 0, 0, 0.22);
```

### 재사용 믹스인
```scss
// shared/styles/mixins/_layout.scss
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

// shared/styles/mixins/_responsive.scss
@mixin mobile {
  @media (max-width: 600px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 601px) and (max-width: 1024px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1025px) {
    @content;
  }
}

// shared/styles/mixins/_effects.scss
@mixin hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin scrollbar {
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

### Material-UI 테마 설정 (스타일 오버라이드 제거)
```typescript
// shared/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#f05545',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
```

## 📝 업무 화면 개발 가이드

### 1. CRUD 화면 패턴

```typescript
// 목록 화면
export const ListPage = () => {
  return (
    <ListPageTemplate
      title="타이틀"
      searchBar={<SearchBar />}
      actions={<Button>Add New</Button>}
    >
      <DataTable data={data} columns={columns} />
    </ListPageTemplate>
  );
};

// 상세 화면
export const DetailPage = () => {
  return (
    <DetailPageTemplate
      title="상세 정보"
      actions={<EditButton />}
    >
      <DescriptionList items={details} />
    </DetailPageTemplate>
  );
};

// 수정 화면
export const EditPage = () => {
  return (
    <FormPageTemplate
      title="수정"
      onSubmit={handleSubmit}
    >
      <Form fields={fields} />
    </FormPageTemplate>
  );
};
```

### 2. 폼 처리 패턴

```typescript
// React Hook Form 활용
import { useForm } from 'react-hook-form';

export const UserForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="이름"
        error={errors.name}
        required
      >
        <TextField
          {...register('name', { required: '필수 항목입니다' })}
        />
      </FormField>
    </form>
  );
};
```

### 3. 상태 관리 패턴

```typescript
// Zustand store
import { create } from 'zustand';

interface UserStore {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    const users = await userApi.getAll();
    set({ users, loading: false });
  },
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
}));
```

## 🚀 개발 워크플로우

### 1. 컴포넌트 개발 프로세스

1. **Storybook에서 컴포넌트 개발**
   ```bash
   npm run storybook
   ```

2. **컴포넌트 생성**
   ```bash
   npm run generate:component Button atoms
   ```

3. **테스트 작성**
   ```typescript
   describe('Button', () => {
     it('should render correctly', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByText('Click me')).toBeInTheDocument();
     });
   });
   ```

### 2. 업무 화면 개발 프로세스

1. **도메인 폴더 생성**
2. **API 클라이언트 구현**
3. **페이지 컴포넌트 생성 (공통 템플릿 활용)**
4. **라우팅 설정**
5. **테스트 및 검증**

## 📏 컴포넌트 사용 지침

### DO✅
- 공통 컴포넌트 우선 사용
- 테마 시스템 활용
- TypeScript 타입 명시
- Storybook 문서화
- 컴포넌트 단위 테스트

### DON'T❌
- 인라인 스타일 사용 (style, sx props 금지)
- CSS-in-JS 사용 (styled-components, emotion 금지)
- any 타입 사용
- 중복 컴포넌트 생성
- 하드코딩된 스타일 값 (SCSS 변수 사용)
- 500줄 초과 컴포넌트

## 📁 컴포넌트 폴더 구조 표준

모든 컴포넌트는 다음 구조를 따릅니다:

```
Button/
├── Button.tsx           # 컴포넌트 로직
├── Button.module.scss   # 컴포넌트 스타일
├── Button.types.ts      # 타입 정의
├── Button.test.tsx      # 테스트
├── Button.stories.tsx   # Storybook
└── index.ts            # export
```

### 스타일 작성 규칙

1. **CSS Modules 사용**
   - 모든 스타일은 `.module.scss` 파일에 작성
   - 클래스명은 camelCase 사용
   - BEM 명명 규칙 적용

2. **SCSS 변수 활용**
   - 색상, 간격, 폰트 등은 변수 사용
   - 하드코딩된 값 금지

3. **반응형 디자인**
   - 믹스인 활용으로 일관된 브레이크포인트

```scss
// 좋은 예시
.container {
  padding: $spacing-md;
  background: $color-background-paper;
  
  @include mobile {
    padding: $spacing-sm;
  }
  
  &__header {
    @include flex-between;
    margin-bottom: $spacing-lg;
  }
  
  &__content {
    color: $color-text-primary;
    
    &--disabled {
      color: $color-text-disabled;
    }
  }
}

// 나쁜 예시 (하드코딩)
.container {
  padding: 16px;        // ❌ 변수 사용하지 않음
  background: #ffffff;  // ❌ 하드코딩된 색상
}

## 🎨 글로벌 스타일 설정

```scss
// shared/styles/globals/reset.scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: $font-family-base;
  color: $color-text-primary;
  background-color: $color-background-default;
  line-height: 1.5;
}

a {
  color: $color-primary;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
```

```scss
// shared/styles/globals/utilities.scss
// 유틸리티 클래스
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-sm { margin-top: $spacing-sm; }
.mt-md { margin-top: $spacing-md; }
.mt-lg { margin-top: $spacing-lg; }

.mb-sm { margin-bottom: $spacing-sm; }
.mb-md { margin-bottom: $spacing-md; }
.mb-lg { margin-bottom: $spacing-lg; }

.p-sm { padding: $spacing-sm; }
.p-md { padding: $spacing-md; }
.p-lg { padding: $spacing-lg; }

.flex { display: flex; }
.flex-column { flex-direction: column; }
.flex-center { @include flex-center; }
.flex-between { @include flex-between; }

.hidden { display: none; }
.visible { display: block; }
```

## 🔧 유틸리티 함수

```typescript
// shared/utils/format.ts
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('ko-KR').format(new Date(date));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

// shared/utils/validation.ts
export const validators = {
  email: (value: string) => 
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
  phone: (value: string) => 
    /^\d{2,3}-\d{3,4}-\d{4}$/.test(value),
  required: (value: any) => 
    value !== null && value !== undefined && value !== '',
};
```
