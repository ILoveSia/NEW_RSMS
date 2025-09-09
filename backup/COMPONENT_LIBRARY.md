# RSMS 공통 컴포넌트 라이브러리 카탈로그

## 📚 컴포넌트 계층 구조

### 🔵 Atoms (기본 컴포넌트)
가장 작은 단위의 재사용 가능한 컴포넌트

#### Button
```typescript
interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

// 사용 예시
<Button variant="contained" color="primary" loading={isLoading}>
  저장
</Button>
```

#### TextField
```typescript
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

// 사용 예시
<TextField
  label="사용자명"
  value={username}
  onChange={setUsername}
  required
  error={!!errors.username}
  helperText={errors.username}
/>
```

#### Select
```typescript
interface SelectProps<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// 사용 예시
<Select
  label="부서"
  value={department}
  onChange={setDepartment}
  options={departmentOptions}
/>
```

#### Checkbox
```typescript
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  color?: 'primary' | 'secondary';
}

// 사용 예시
<Checkbox
  label="전체 선택"
  checked={selectAll}
  onChange={setSelectAll}
/>
```

#### Radio
```typescript
interface RadioGroupProps<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  row?: boolean;
  disabled?: boolean;
}

// 사용 예시
<RadioGroup
  label="성별"
  value={gender}
  onChange={setGender}
  options={[
    { value: 'M', label: '남성' },
    { value: 'F', label: '여성' }
  ]}
/>
```

#### DatePicker
```typescript
interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// 사용 예시
<DatePicker
  label="시작일"
  value={startDate}
  onChange={setStartDate}
  required
/>
```

#### Label
```typescript
interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
  description?: string;
}

// 사용 예시
<Label required error={hasError}>
  이메일 주소
</Label>
```

#### Badge
```typescript
interface BadgeProps {
  count: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'standard' | 'dot';
  children: React.ReactNode;
}

// 사용 예시
<Badge count={5} color="error">
  <NotificationIcon />
</Badge>
```

### 🟢 Molecules (복합 컴포넌트)
Atoms를 조합하여 만든 컴포넌트

#### SearchBar
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  onClear?: () => void;
}

// 사용 예시
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  placeholder="사용자 검색..."
/>
```

#### FormField
```typescript
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  inline?: boolean;
}

// 사용 예시
<FormField label="이메일" required error={errors.email}>
  <TextField value={email} onChange={setEmail} />
</FormField>
```

#### Card
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

// 사용 예시
<Card 
  title="사용자 정보" 
  subtitle="기본 정보를 입력하세요"
  actions={<Button>저장</Button>}
>
  <UserForm />
</Card>
```

#### Dialog
```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

// 사용 예시
<Dialog
  open={isOpen}
  onClose={handleClose}
  title="사용자 추가"
  actions={
    <>
      <Button onClick={handleClose}>취소</Button>
      <Button variant="contained" onClick={handleSave}>저장</Button>
    </>
  }
>
  <UserForm />
</Dialog>
```

#### Tabs
```typescript
interface TabsProps {
  value: string | number;
  onChange: (value: string | number) => void;
  tabs: Array<{
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

// 사용 예시
<Tabs
  value={activeTab}
  onChange={setActiveTab}
  tabs={[
    { value: 'info', label: '기본정보' },
    { value: 'permissions', label: '권한' },
    { value: 'history', label: '이력' }
  ]}
/>
```

#### Alert
```typescript
interface AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  variant?: 'standard' | 'filled' | 'outlined';
}

// 사용 예시
<Alert severity="error" title="오류 발생">
  사용자 정보를 불러올 수 없습니다.
</Alert>
```

#### DateRangePicker
```typescript
interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

// 사용 예시
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={(start, end) => {
    setStartDate(start);
    setEndDate(end);
  }}
  label="조회 기간"
/>
```

### 🟡 Organisms (복잡한 컴포넌트)
여러 Molecules와 Atoms를 조합한 독립적인 기능 단위

#### DataTable
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
  };
  sorting?: {
    orderBy: string;
    order: 'asc' | 'desc';
    onSort: (orderBy: string) => void;
  };
  selection?: {
    selected: T[];
    onSelect: (rows: T[]) => void;
  };
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    disabled?: (row: T) => boolean;
  }>;
  emptyMessage?: string;
}

// 사용 예시
<DataTable
  data={users}
  columns={[
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    { key: 'role', label: '권한', render: (role) => <Badge>{role}</Badge> },
    { key: 'createdAt', label: '생성일', render: (date) => formatDate(date) }
  ]}
  loading={isLoading}
  onRowClick={handleRowClick}
  pagination={{
    page,
    rowsPerPage,
    total: totalCount,
    onPageChange: setPage,
    onRowsPerPageChange: setRowsPerPage
  }}
  actions={[
    { label: '수정', icon: <EditIcon />, onClick: handleEdit },
    { label: '삭제', icon: <DeleteIcon />, onClick: handleDelete }
  ]}
/>
```

#### Form
```typescript
interface FormProps {
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'checkbox' | 'radio' | 'date' | 'textarea';
    required?: boolean;
    validation?: any;
    options?: Array<{ value: any; label: string }>;
    grid?: { xs?: number; sm?: number; md?: number; lg?: number };
  }>;
  values: Record<string, any>;
  errors?: Record<string, string>;
  onChange: (name: string, value: any) => void;
  onSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
}

// 사용 예시
<Form
  fields={[
    { name: 'name', label: '이름', type: 'text', required: true },
    { name: 'email', label: '이메일', type: 'text', required: true },
    { name: 'role', label: '권한', type: 'select', options: roleOptions },
    { name: 'active', label: '활성화', type: 'checkbox' }
  ]}
  values={formValues}
  errors={formErrors}
  onChange={handleFieldChange}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

#### FileUpload
```typescript
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  files: File[];
  onChange: (files: File[]) => void;
  onRemove?: (file: File) => void;
  disabled?: boolean;
  dragDrop?: boolean;
  preview?: boolean;
}

// 사용 예시
<FileUpload
  accept="image/*,.pdf"
  multiple
  maxSize={5 * 1024 * 1024} // 5MB
  files={uploadedFiles}
  onChange={setUploadedFiles}
  dragDrop
  preview
/>
```

#### Sidebar
```typescript
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: Array<{ id: string; label: string; path: string }>;
    badge?: number;
  }>;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  variant?: 'permanent' | 'temporary' | 'persistent';
}

// 사용 예시
<Sidebar
  open={sidebarOpen}
  onToggle={toggleSidebar}
  items={menuItems}
  activeItem={activeMenuItem}
  onItemClick={handleMenuClick}
/>
```

#### Header
```typescript
interface HeaderProps {
  title?: string;
  logo?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  notifications?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onUserClick?: () => void;
  actions?: React.ReactNode;
}

// 사용 예시
<Header
  title="RSMS"
  user={currentUser}
  notifications={notificationCount}
  onMenuClick={toggleSidebar}
  onNotificationClick={openNotifications}
  onUserClick={openUserMenu}
/>
```

### 🔴 Templates (페이지 템플릿)
재사용 가능한 페이지 레이아웃

#### ListPageTemplate
```typescript
interface ListPageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  searchBar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
}

// 사용 예시
<ListPageTemplate
  title="사용자 관리"
  subtitle="시스템 사용자를 관리합니다"
  breadcrumbs={[
    { label: '홈', path: '/' },
    { label: '시스템 관리', path: '/system' },
    { label: '사용자 관리' }
  ]}
  searchBar={<SearchBar />}
  filters={<FilterPanel />}
  actions={<Button>사용자 추가</Button>}
>
  <DataTable data={users} columns={columns} />
</ListPageTemplate>
```

#### DetailPageTemplate
```typescript
interface DetailPageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  sidebar?: React.ReactNode;
}

// 사용 예시
<DetailPageTemplate
  title={user.name}
  subtitle={user.email}
  breadcrumbs={breadcrumbs}
  actions={
    <>
      <Button>수정</Button>
      <Button color="error">삭제</Button>
    </>
  }
  tabs={<Tabs />}
>
  <UserDetail user={user} />
</DetailPageTemplate>
```

#### FormPageTemplate
```typescript
interface FormPageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// 사용 예시
<FormPageTemplate
  title="사용자 등록"
  subtitle="새로운 사용자를 등록합니다"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitText="등록"
  loading={isSubmitting}
>
  <Form fields={userFields} />
</FormPageTemplate>
```

#### DashboardTemplate
```typescript
interface DashboardTemplateProps {
  title: string;
  dateRange?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  grid?: Array<{
    component: React.ReactNode;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  }>;
}

// 사용 예시
<DashboardTemplate
  title="대시보드"
  dateRange={<DateRangePicker />}
  actions={<Button>리포트 다운로드</Button>}
  grid={[
    { component: <SummaryCard />, md: 3 },
    { component: <ChartCard />, md: 9 },
    { component: <TableCard />, md: 12 }
  ]}
/>
```

## 🎨 스타일링 가이드

### 테마 토큰
```typescript
// 색상
colors: {
  primary: '#1976d2',
  secondary: '#dc004e',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  success: '#4caf50',
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
}

// 간격
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

// 그림자
shadows: {
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '0 3px 6px rgba(0,0,0,0.16)',
  lg: '0 10px 20px rgba(0,0,0,0.19)',
}

// Border Radius
borderRadius: {
  sm: 4,
  md: 8,
  lg: 16,
  full: '50%',
}
```

## 📦 컴포넌트 Import 방법

```typescript
// 개별 import
import { Button, TextField, DataTable } from '@/shared/components';

// 카테고리별 import
import { Button, TextField } from '@/shared/components/atoms';
import { SearchBar, FormField } from '@/shared/components/molecules';
import { DataTable, Form } from '@/shared/components/organisms';
import { ListPageTemplate } from '@/shared/components/templates';

// 전체 import (비추천)
import * as Components from '@/shared/components';
```

## 🔧 커스터마이징

### 컴포넌트 확장
```typescript
// 기존 컴포넌트를 확장하여 도메인 특화 컴포넌트 생성
import { Button as BaseButton } from '@/shared/components';

export const ApprovalButton = (props) => {
  return (
    <BaseButton
      {...props}
      color="primary"
      variant="contained"
      startIcon={<CheckIcon />}
    >
      {props.children || '승인'}
    </BaseButton>
  );
};
```

### 스타일 오버라이드
```typescript
import { styled } from '@mui/material/styles';
import { DataTable } from '@/shared/components';

const CustomDataTable = styled(DataTable)`
  .MuiTableCell-root {
    padding: 12px 16px;
  }
  
  .MuiTableRow-root:hover {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;
```

## 🚀 Best Practices

1. **컴포넌트 선택 가이드**
   - 가능한 한 낮은 레벨의 컴포넌트부터 사용
   - 필요한 기능에 맞는 적절한 레벨 선택
   - 과도한 props drilling 피하기

2. **성능 최적화**
   - React.memo를 활용한 불필요한 리렌더링 방지
   - 큰 리스트는 가상화(virtualization) 적용
   - 이미지는 lazy loading 적용

3. **접근성(a11y)**
   - 모든 인터랙티브 요소에 적절한 ARIA 레이블
   - 키보드 네비게이션 지원
   - 충분한 색상 대비

4. **테스팅**
   - 각 컴포넌트별 단위 테스트
   - Storybook을 통한 시각적 테스트
   - 접근성 테스트