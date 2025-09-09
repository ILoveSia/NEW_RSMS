# AG-Grid 통합 가이드 (CSS Modules + SCSS)

## 📋 개요
RSMS 프로젝트에서 AG-Grid를 CSS Modules + SCSS 구조에 맞게 통합하는 가이드입니다.
AG-Grid는 업무 시스템에 최적화된 강력한 데이터 그리드 컴포넌트입니다.

## 📦 AG-Grid 패키지 설치

### 1. 필수 패키지 설치
```bash
# AG-Grid 커뮤니티 에디션 (무료)
npm install ag-grid-react ag-grid-community

# AG-Grid 엔터프라이즈 (유료 - 고급 기능)
# npm install ag-grid-react ag-grid-enterprise

# 추가 유틸리티
npm install @types/ag-grid-community
```

### 2. 패키지 정보
```json
{
  "dependencies": {
    "ag-grid-react": "^31.0.0",
    "ag-grid-community": "^31.0.0"
  }
}
```

## 🎨 AG-Grid 스타일링 구조

### 1. AG-Grid 테마 및 CSS 구조
```
src/shared/styles/
├── ag-grid/
│   ├── themes/
│   │   ├── ag-theme-rsms.scss      # 커스텀 테마
│   │   ├── ag-theme-variables.scss # AG-Grid 변수 오버라이드
│   │   └── index.scss              # AG-Grid 스타일 통합
│   ├── components/
│   │   ├── cell-renderers.scss     # 셀 렌더러 스타일
│   │   ├── header-components.scss  # 헤더 컴포넌트 스타일
│   │   └── custom-components.scss  # 커스텀 컴포넌트 스타일
│   └── index.scss                  # AG-Grid 전체 통합
```

### 2. 커스텀 AG-Grid 테마 생성
```scss
// shared/styles/ag-grid/themes/ag-theme-variables.scss
// AG-Grid 기본 변수 오버라이드
$ag-foreground-color: $color-text-primary;
$ag-background-color: $color-background-paper;
$ag-header-foreground-color: $color-text-primary;
$ag-header-background-color: $color-gray-50;
$ag-odd-row-background-color: $color-gray-50;
$ag-row-hover-color: rgba($color-primary, 0.04);
$ag-selected-row-background-color: rgba($color-primary, 0.08);
$ag-border-color: $color-border-light;
$ag-primary-color: $color-primary;
$ag-accent-color: $color-secondary;
$ag-checkbox-checked-color: $color-primary;

// 폰트 설정
$ag-font-family: $font-family-base;
$ag-font-size: $font-size-base;

// 간격 설정
$ag-grid-size: $spacing-sm;  // 8px
$ag-row-height: 48px;
$ag-header-height: 56px;

// 테두리 반경
$ag-border-radius: $border-radius-md;

// 그림자
$ag-popup-shadow: $shadow-lg;
```

```scss
// shared/styles/ag-grid/themes/ag-theme-rsms.scss
@import '~ag-grid-community/styles/ag-grid.css';
@import '~ag-grid-community/styles/ag-theme-alpine.css';
@import './ag-theme-variables.scss';

.ag-theme-rsms {
  // 기본 AG-Theme-Alpine 확장
  @extend .ag-theme-alpine;
  
  // 커스텀 스타일링
  font-family: $font-family-base;
  
  // 헤더 스타일링
  .ag-header {
    font-weight: $font-weight-semibold;
    border-bottom: 2px solid $color-border-default;
  }
  
  .ag-header-cell {
    &:hover {
      background-color: rgba($color-primary, 0.04);
    }
  }
  
  // 행 스타일링
  .ag-row {
    &:hover {
      background-color: $ag-row-hover-color;
    }
    
    &.ag-row-selected {
      background-color: $ag-selected-row-background-color;
      border-left: 3px solid $color-primary;
    }
  }
  
  // 셀 스타일링
  .ag-cell {
    border-right: 1px solid $color-border-light;
    
    &:focus {
      border: 2px solid $color-primary;
      outline: none;
    }
  }
  
  // 페이지네이션 스타일링
  .ag-paging-panel {
    border-top: 1px solid $color-border-default;
    background-color: $color-background-paper;
    padding: $spacing-md;
    
    .ag-paging-button {
      @include transition(all, 0.2s);
      border-radius: $border-radius-sm;
      
      &:hover:not(.ag-disabled) {
        background-color: rgba($color-primary, 0.04);
        color: $color-primary;
      }
      
      &.ag-disabled {
        opacity: 0.5;
      }
    }
  }
  
  // 필터 패널 스타일링
  .ag-filter {
    font-family: $font-family-base;
    
    .ag-filter-apply-panel {
      .ag-button {
        background-color: $color-primary;
        border-color: $color-primary;
        color: $color-primary-contrast;
        border-radius: $border-radius-md;
        @include transition(all, 0.2s);
        
        &:hover {
          background-color: $color-primary-dark;
          @include hover-lift;
        }
      }
    }
  }
  
  // 로딩 오버레이
  .ag-overlay-loading-wrapper {
    background-color: rgba($color-white, 0.8);
    
    .ag-overlay-loading-center {
      background-color: $color-background-paper;
      border-radius: $border-radius-lg;
      box-shadow: $shadow-md;
      padding: $spacing-lg;
    }
  }
  
  // 정렬 아이콘 스타일링
  .ag-sort-ascending-icon,
  .ag-sort-descending-icon {
    color: $color-primary;
  }
  
  // 체크박스 스타일링
  .ag-checkbox {
    .ag-input-wrapper {
      border-radius: $border-radius-sm;
    }
    
    input[type="checkbox"]:checked + .ag-input-wrapper::after {
      color: $color-primary-contrast;
    }
  }
}
```

## 🔧 AG-Grid 공통 컴포넌트 구현

### 1. BaseDataGrid 컴포넌트
```typescript
// shared/components/organisms/BaseDataGrid/BaseDataGrid.tsx
import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  GridReadyEvent, 
  GridOptions,
  SelectionChangedEvent,
  CellClickedEvent,
  GridApi,
  ColumnApi
} from 'ag-grid-community';
import { clsx } from 'clsx';
import { CircularProgress } from '@mui/material';
import styles from './BaseDataGrid.module.scss';

interface BaseDataGridProps {
  // 데이터 관련
  rowData: any[];
  columnDefs: ColDef[];
  
  // 그리드 설정
  loading?: boolean;
  height?: number | string;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationAutoPageSize?: boolean;
  
  // 선택 관련
  rowSelection?: 'single' | 'multiple';
  selectedRows?: any[];
  onSelectionChanged?: (selectedRows: any[]) => void;
  
  // 이벤트 핸들러
  onCellClicked?: (event: CellClickedEvent) => void;
  onRowDoubleClicked?: (event: any) => void;
  onGridReady?: (event: GridReadyEvent) => void;
  
  // 필터링 & 정렬
  defaultColDef?: ColDef;
  enableFilter?: boolean;
  enableSorting?: boolean;
  
  // 스타일링
  className?: string;
  theme?: string;
  
  // 추가 GridOptions
  gridOptions?: GridOptions;
}

export const BaseDataGrid: React.FC<BaseDataGridProps> = ({
  rowData,
  columnDefs,
  loading = false,
  height = 500,
  pagination = true,
  paginationPageSize = 20,
  paginationAutoPageSize = false,
  rowSelection = 'multiple',
  selectedRows = [],
  onSelectionChanged,
  onCellClicked,
  onRowDoubleClicked,
  onGridReady,
  defaultColDef,
  enableFilter = true,
  enableSorting = true,
  className,
  theme = 'ag-theme-rsms',
  gridOptions = {},
}) => {
  // 기본 컬럼 설정
  const defaultColumnDef = useMemo<ColDef>(() => ({
    sortable: enableSorting,
    filter: enableFilter,
    resizable: true,
    minWidth: 100,
    cellClass: styles.cell,
    headerClass: styles.header,
    ...defaultColDef
  }), [enableSorting, enableFilter, defaultColDef]);

  // Grid API 참조
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = React.useState<ColumnApi | null>(null);

  // Grid Ready 이벤트
  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
    setColumnApi(event.columnApi);
    
    if (paginationAutoPageSize) {
      event.api.sizeColumnsToFit();
    }
    
    onGridReady?.(event);
  }, [onGridReady, paginationAutoPageSize]);

  // 선택 변경 이벤트
  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    onSelectionChanged?.(selectedRows);
  }, [onSelectionChanged]);

  // 그리드 옵션
  const gridOptionsConfig = useMemo<GridOptions>(() => ({
    rowData,
    columnDefs,
    defaultColDef: defaultColumnDef,
    
    // 페이지네이션
    pagination,
    paginationPageSize,
    paginationAutoPageSize,
    
    // 선택
    rowSelection,
    suppressRowClickSelection: rowSelection === 'multiple',
    
    // 이벤트
    onGridReady: handleGridReady,
    onSelectionChanged: handleSelectionChanged,
    onCellClicked,
    onRowDoubleClicked,
    
    // 기타 설정
    animateRows: true,
    suppressMovableColumns: false,
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,
    
    // 로딩 설정
    loadingOverlayComponent: 'agLoadingOverlay',
    noRowsOverlayComponent: 'agNoRowsOverlay',
    
    // 커스텀 그리드 옵션 병합
    ...gridOptions
  }), [
    rowData,
    columnDefs,
    defaultColumnDef,
    pagination,
    paginationPageSize,
    paginationAutoPageSize,
    rowSelection,
    handleGridReady,
    handleSelectionChanged,
    onCellClicked,
    onRowDoubleClicked,
    gridOptions
  ]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={clsx(styles.loadingContainer, theme)} style={{ height }}>
        <div className={styles.loadingContent}>
          <CircularProgress size={40} />
          <span className={styles.loadingText}>데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={clsx(styles.gridContainer, theme, className)} 
      style={{ height }}
    >
      <AgGridReact 
        {...gridOptionsConfig}
      />
    </div>
  );
};
```

### 2. BaseDataGrid 스타일
```scss
// shared/components/organisms/BaseDataGrid/BaseDataGrid.module.scss
@import '@/shared/styles/ag-grid';

.gridContainer {
  width: 100%;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  
  // 그리드 내부 스타일링은 ag-theme-rsms에서 처리
}

.loadingContainer {
  @include flex-center;
  background-color: $color-background-paper;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  
  .loadingContent {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-md;
    
    .loadingText {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
}

// 셀과 헤더 기본 스타일
.cell {
  @include flex-start;
  padding: $spacing-sm $spacing-md;
}

.header {
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}
```

## 🎯 커스텀 셀 렌더러 구현

### 1. 상태 셀 렌더러
```typescript
// shared/components/ag-grid/cell-renderers/StatusCellRenderer.tsx
import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@mui/material';
import styles from './StatusCellRenderer.module.scss';

interface StatusCellRendererProps extends ICellRendererParams {
  value: 'active' | 'inactive' | 'pending' | 'error';
}

const statusConfig = {
  active: { label: '활성', color: 'success' as const },
  inactive: { label: '비활성', color: 'default' as const },
  pending: { label: '대기', color: 'warning' as const },
  error: { label: '오류', color: 'error' as const },
};

export const StatusCellRenderer: React.FC<StatusCellRendererProps> = ({ value }) => {
  if (!value || !statusConfig[value]) {
    return <span>-</span>;
  }

  const config = statusConfig[value];

  return (
    <div className={styles.statusCell}>
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    </div>
  );
};
```

```scss
// shared/components/ag-grid/cell-renderers/StatusCellRenderer.module.scss
.statusCell {
  @include flex-start;
  height: 100%;
}
```

### 2. 액션 버튼 셀 렌더러
```typescript
// shared/components/ag-grid/cell-renderers/ActionCellRenderer.tsx
import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from './ActionCellRenderer.module.scss';

interface ActionCellRendererProps extends ICellRendererParams {
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export const ActionCellRenderer: React.FC<ActionCellRendererProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
}) => {
  return (
    <div className={styles.actionCell}>
      {showView && onView && (
        <Tooltip title="보기">
          <IconButton
            size="small"
            onClick={() => onView(data)}
            className={styles.actionButton}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {showEdit && onEdit && (
        <Tooltip title="수정">
          <IconButton
            size="small"
            onClick={() => onEdit(data)}
            className={styles.actionButton}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {showDelete && onDelete && (
        <Tooltip title="삭제">
          <IconButton
            size="small"
            onClick={() => onDelete(data)}
            className={styles.actionButton}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};
```

```scss
// shared/components/ag-grid/cell-renderers/ActionCellRenderer.module.scss
.actionCell {
  @include flex-start;
  gap: $spacing-xs;
  height: 100%;
  
  .actionButton {
    @include transition(all, 0.2s);
    
    &:hover {
      background-color: rgba($color-primary, 0.08);
      transform: scale(1.1);
    }
  }
}
```

## 📊 업무 화면에서 AG-Grid 사용 예제

### 1. 사용자 관리 그리드
```typescript
// domains/user/components/UserDataGrid.tsx
import React, { useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { BaseDataGrid } from '@shared/components/organisms/BaseDataGrid';
import { StatusCellRenderer } from '@shared/components/ag-grid/cell-renderers/StatusCellRenderer';
import { ActionCellRenderer } from '@shared/components/ag-grid/cell-renderers/ActionCellRenderer';
import { formatDate } from '@shared/utils/format';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UserDataGridProps {
  users: User[];
  loading?: boolean;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onSelectionChanged?: (selectedUsers: User[]) => void;
}

export const UserDataGrid: React.FC<UserDataGridProps> = ({
  users,
  loading,
  onView,
  onEdit,
  onDelete,
  onSelectionChanged,
}) => {
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: '선택',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      lockPosition: true,
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: '이름',
      field: 'name',
      width: 120,
      pinned: 'left',
      cellClass: 'font-weight-medium',
    },
    {
      headerName: '이메일',
      field: 'email',
      width: 200,
      cellRenderer: (params: any) => (
        <a href={`mailto:${params.value}`} style={{ color: '#1976d2' }}>
          {params.value}
        </a>
      ),
    },
    {
      headerName: '부서',
      field: 'department',
      width: 120,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['IT팀', '인사팀', '재무팀', '영업팀'],
      },
    },
    {
      headerName: '권한',
      field: 'role',
      width: 100,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['관리자', '사용자', '조회자'],
      },
    },
    {
      headerName: '상태',
      field: 'status',
      width: 100,
      cellRenderer: StatusCellRenderer,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['active', 'inactive'],
      },
    },
    {
      headerName: '등록일',
      field: 'createdAt',
      width: 120,
      valueFormatter: (params: any) => formatDate(params.value),
      filter: 'agDateColumnFilter',
    },
    {
      headerName: '작업',
      width: 120,
      pinned: 'right',
      cellRenderer: ActionCellRenderer,
      cellRendererParams: {
        onView,
        onEdit,
        onDelete,
        showView: !!onView,
        showEdit: !!onEdit,
        showDelete: !!onDelete,
      },
      sortable: false,
      filter: false,
      suppressMenu: true,
    },
  ], [onView, onEdit, onDelete]);

  return (
    <BaseDataGrid
      rowData={users}
      columnDefs={columnDefs}
      loading={loading}
      height={600}
      pagination={true}
      paginationPageSize={50}
      rowSelection="multiple"
      onSelectionChanged={onSelectionChanged}
      enableFilter={true}
      enableSorting={true}
    />
  );
};
```

### 2. 업무 화면 템플릿에서 AG-Grid 사용
```typescript
// domains/user/pages/UserListPage.tsx
import React, { useState, useEffect } from 'react';
import { ListPageTemplate } from '@shared/components/templates/ListPageTemplate';
import { SearchBar } from '@shared/components/molecules/SearchBar';
import { Button } from '@shared/components/atoms/Button';
import { UserDataGrid } from '../components/UserDataGrid';
import AddIcon from '@mui/icons-material/Add';
import GetAppIcon from '@mui/icons-material/GetApp';

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // API 호출 로직
  useEffect(() => {
    // fetchUsers();
  }, []);

  const handleView = (user: User) => {
    console.log('View user:', user);
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user: User) => {
    console.log('Delete user:', user);
  };

  const handleExport = () => {
    console.log('Export selected users:', selectedUsers);
  };

  return (
    <ListPageTemplate
      title="사용자 관리"
      subtitle={`총 ${users.length}명의 사용자가 등록되어 있습니다.`}
      breadcrumbs={[
        { label: '홈', path: '/' },
        { label: '시스템 관리' },
        { label: '사용자 관리' }
      ]}
      searchBar={
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={(term) => console.log('Search:', term)}
          placeholder="이름, 이메일로 검색..."
          fullWidth
        />
      }
      actions={
        <>
          {selectedUsers.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={handleExport}
            >
              선택 항목 내보내기 ({selectedUsers.length})
            </Button>
          )}
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => console.log('Add user')}
          >
            사용자 추가
          </Button>
        </>
      }
    >
      <UserDataGrid
        users={users}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelectionChanged={setSelectedUsers}
      />
    </ListPageTemplate>
  );
};
```

## 📋 AG-Grid 설정 체크리스트

### 프로젝트 설정
- [ ] AG-Grid 패키지 설치
- [ ] 커스텀 테마 (ag-theme-rsms) 생성
- [ ] SCSS 변수로 AG-Grid 스타일 통합
- [ ] BaseDataGrid 공통 컴포넌트 구현

### 컴포넌트 개발
- [ ] 업무별 그리드 컴포넌트 생성
- [ ] 커스텀 셀 렌더러 구현
- [ ] 필터링 설정
- [ ] 페이지네이션 설정
- [ ] 정렬 및 선택 기능 구현

### 성능 최적화
- [ ] 가상화 설정 (대용량 데이터)
- [ ] 지연 로딩 구현
- [ ] 메모리 누수 방지
- [ ] 반응형 그리드 설정

## 🎉 결과

이제 RSMS 프로젝트에서 **AG-Grid + CSS Modules + SCSS** 조합으로 강력하고 일관된 데이터 그리드 시스템을 사용할 수 있습니다!

- 🎨 **일관된 스타일**: RSMS 디자인 시스템과 완벽 통합
- ⚡ **고성능**: 대용량 데이터 처리 최적화
- 🔧 **재사용성**: BaseDataGrid로 빠른 그리드 개발
- 📱 **반응형**: 모든 디바이스에서 최적화된 UX