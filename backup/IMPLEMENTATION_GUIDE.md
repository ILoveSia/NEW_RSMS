# RSMS 구현 가이드

## 🎯 개요
RSMS 프론트엔드를 공통 컴포넌트 기반으로 재구축하기 위한 실무 구현 가이드입니다.

## 📋 구현 단계

### Phase 1: 프로젝트 초기 설정
```bash
# 1. 프로젝트 생성
npm create vite@latest rsms-frontend -- --template react-ts

# 2. 디렉토리 이동
cd rsms-frontend

# 3. 필수 패키지 설치
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers
npm install zustand @tanstack/react-query
npm install react-hook-form react-router-dom
npm install axios dayjs

# 4. 개발 도구 설치
npm install -D @types/react @types/react-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D @storybook/react @storybook/addon-essentials
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Phase 2: 폴더 구조 생성
```bash
# shared 폴더 구조
mkdir -p src/shared/components/{atoms,molecules,organisms,templates}
mkdir -p src/shared/{hooks,utils,types,constants,styles}

# domains 폴더 구조
mkdir -p src/domains/{user,audit,resp,approval}
mkdir -p src/domains/user/{api,components,pages,hooks,store,types}

# app 폴더 구조
mkdir -p src/app/{router,store,config,providers,layouts}
```

### Phase 3: 기본 설정 파일

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@domains/*": ["./src/domains/*"],
      "@app/*": ["./src/app/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@app': path.resolve(__dirname, './src/app')
    }
  }
});
```

## 🎨 공통 컴포넌트 구현

### Button 컴포넌트 예제
```typescript
// src/shared/components/atoms/Button/Button.tsx
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'disabled'> {
  loading?: boolean;
  loadingText?: string;
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: '8px 16px',
  '&.Mui-disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'auto'
  }
}));

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  startIcon,
  ...props
}) => {
  return (
    <StyledButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </StyledButton>
  );
};

// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### DataTable 컴포넌트 예제
```typescript
// src/shared/components/organisms/DataTable/DataTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Skeleton
} from '@mui/material';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: T[];
  onSelectionChange?: (selected: T[]) => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
  };
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectionChange,
  pagination
}: DataTableProps<T>) {
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(data);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T) => {
    const selectedIndex = selected.findIndex(item => item.id === row.id);
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter(item => item.id !== row.id);
    }

    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: T) => selected.some(item => item.id === row.id);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton variant="rectangular" width={20} height={20} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              data.map((row) => {
                const isRowSelected = isSelected(row);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick?.(row)}
                    selected={isRowSelected}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isRowSelected}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={String(column.key)} align={column.align || 'left'}>
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          onRowsPerPageChange={(e) => pagination.onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </>
  );
}
```

## 📄 업무 화면 구현 예제

### 사용자 관리 목록 화면
```typescript
// src/domains/user/pages/UserListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ListPageTemplate, 
  DataTable, 
  SearchBar, 
  Button 
} from '@/shared/components';
import { useUserStore } from '../store/userStore';
import { User } from '../types/user.types';
import { formatDate } from '@/shared/utils/format';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading, fetchUsers, total } = useUserStore();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers({ page, rowsPerPage, search });
  }, [page, rowsPerPage, search]);

  const handleSearch = () => {
    setPage(0);
    fetchUsers({ page: 0, rowsPerPage, search });
  };

  const handleAddUser = () => {
    navigate('/users/new');
  };

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const columns = [
    { 
      key: 'name', 
      label: '이름',
      render: (value: string, row: User) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      )
    },
    { key: 'email', label: '이메일' },
    { key: 'department', label: '부서' },
    { 
      key: 'role', 
      label: '권한',
      render: (value: string) => {
        const roleMap: Record<string, string> = {
          ADMIN: '관리자',
          USER: '사용자',
          VIEWER: '조회자'
        };
        return roleMap[value] || value;
      }
    },
    { 
      key: 'status', 
      label: '상태',
      render: (value: string) => (
        <Chip 
          label={value === 'ACTIVE' ? '활성' : '비활성'} 
          color={value === 'ACTIVE' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      key: 'createdAt', 
      label: '등록일',
      render: (value: string) => formatDate(value)
    }
  ];

  return (
    <ListPageTemplate
      title="사용자 관리"
      subtitle="시스템 사용자를 관리합니다"
      searchBar={
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="이름, 이메일로 검색..."
          loading={loading}
        />
      }
      actions={
        <>
          {selected.length > 0 && (
            <Button 
              color="error" 
              onClick={handleBulkDelete}
            >
              선택 삭제 ({selected.length})
            </Button>
          )}
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            사용자 추가
          </Button>
        </>
      }
    >
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        selectable
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{
          page,
          rowsPerPage,
          total,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage
        }}
      />
    </ListPageTemplate>
  );
};
```

### 사용자 등록 폼 화면
```typescript
// src/domains/user/pages/UserFormPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FormPageTemplate,
  TextField,
  Select,
  FormField
} from '@/shared/components';
import { useUserStore } from '../store/userStore';
import { CreateUserDto } from '../types/user.types';

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const { createUser, updateUser, loading } = useUserStore();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateUserDto>({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      role: 'USER',
      phone: '',
      position: ''
    }
  });

  const onSubmit = async (data: CreateUserDto) => {
    try {
      if (isEdit) {
        await updateUser(id, data);
      } else {
        await createUser(data);
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <FormPageTemplate
      title={isEdit ? '사용자 수정' : '사용자 등록'}
      subtitle={isEdit ? '사용자 정보를 수정합니다' : '새로운 사용자를 등록합니다'}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      submitText={isEdit ? '수정' : '등록'}
      loading={loading}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormField label="이름" required error={errors.name?.message}>
            <TextField
              {...register('name', { 
                required: '이름은 필수 입력 항목입니다',
                minLength: { value: 2, message: '이름은 2자 이상이어야 합니다' }
              })}
              placeholder="홍길동"
              error={!!errors.name}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField label="이메일" required error={errors.email?.message}>
            <TextField
              {...register('email', { 
                required: '이메일은 필수 입력 항목입니다',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 형식이 아닙니다'
                }
              })}
              placeholder="example@company.com"
              error={!!errors.email}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField label="부서" required error={errors.department?.message}>
            <Select
              {...register('department', { required: '부서는 필수 선택 항목입니다' })}
              options={[
                { value: 'IT', label: 'IT팀' },
                { value: 'HR', label: '인사팀' },
                { value: 'FINANCE', label: '재무팀' },
                { value: 'SALES', label: '영업팀' }
              ]}
              error={!!errors.department}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField label="권한" required error={errors.role?.message}>
            <Select
              {...register('role', { required: '권한은 필수 선택 항목입니다' })}
              options={[
                { value: 'ADMIN', label: '관리자' },
                { value: 'USER', label: '사용자' },
                { value: 'VIEWER', label: '조회자' }
              ]}
              error={!!errors.role}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField label="연락처" error={errors.phone?.message}>
            <TextField
              {...register('phone', {
                pattern: {
                  value: /^\d{2,3}-\d{3,4}-\d{4}$/,
                  message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
                }
              })}
              placeholder="010-1234-5678"
              error={!!errors.phone}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField label="직급">
            <TextField
              {...register('position')}
              placeholder="대리"
            />
          </FormField>
        </Grid>
      </Grid>
    </FormPageTemplate>
  );
};
```

## 🔗 상태 관리 구현

### Zustand Store 예제
```typescript
// src/domains/user/store/userStore.ts
import { create } from 'zustand';
import { userApi } from '../api/userApi';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  total: number;
  
  // Actions
  fetchUsers: (params?: { page?: number; rowsPerPage?: number; search?: string }) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<void>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,

  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await userApi.getUsers(params);
      set({ 
        users: response.data, 
        total: response.total,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: '사용자 목록을 불러오는데 실패했습니다', 
        loading: false 
      });
    }
  },

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = await userApi.getUser(id);
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ 
        error: '사용자 정보를 불러오는데 실패했습니다', 
        loading: false 
      });
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await userApi.createUser(data);
      set((state) => ({
        users: [...state.users, user],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: '사용자 생성에 실패했습니다', 
        loading: false 
      });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const user = await userApi.updateUser(id, data);
      set((state) => ({
        users: state.users.map(u => u.id === id ? user : u),
        currentUser: state.currentUser?.id === id ? user : state.currentUser,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: '사용자 수정에 실패했습니다', 
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await userApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter(u => u.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: '사용자 삭제에 실패했습니다', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
```

## 🚀 실행 및 빌드

### 개발 서버 실행
```bash
npm run dev
```

### Storybook 실행
```bash
npm run storybook
```

### 테스트 실행
```bash
npm run test
npm run test:coverage
```

### 프로덕션 빌드
```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

## 📌 체크리스트

### 개발 시작 전
- [ ] 프로젝트 구조 생성 완료
- [ ] 필수 패키지 설치 완료
- [ ] 환경 설정 파일 생성 완료
- [ ] 테마 및 스타일 설정 완료

### 컴포넌트 개발
- [ ] Atoms 컴포넌트 구현
- [ ] Molecules 컴포넌트 구현
- [ ] Organisms 컴포넌트 구현
- [ ] Templates 구현
- [ ] Storybook 문서화
- [ ] 컴포넌트 테스트 작성

### 업무 화면 개발
- [ ] 도메인별 폴더 구조 생성
- [ ] API 클라이언트 구현
- [ ] 상태 관리 Store 구현
- [ ] 페이지 컴포넌트 구현
- [ ] 라우팅 설정
- [ ] 통합 테스트

### 품질 관리
- [ ] TypeScript 타입 검사 통과
- [ ] ESLint 규칙 준수
- [ ] 테스트 커버리지 80% 이상
- [ ] 번들 크기 최적화
- [ ] 성능 프로파일링

## 🎯 성과 지표

- **재사용성**: 공통 컴포넌트 사용률 90% 이상
- **개발 속도**: 새 화면 개발 시간 50% 단축
- **코드 품질**: 중복 코드 5% 미만
- **유지보수성**: 컴포넌트 단위 테스트 100%
- **성능**: 초기 로딩 시간 2초 이내
