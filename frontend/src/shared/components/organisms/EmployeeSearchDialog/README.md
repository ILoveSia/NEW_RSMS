# EmployeeSearchDialog - 공통 직원조회 팝업

여러 화면에서 재사용 가능한 공통 직원 검색 다이얼로그 컴포넌트입니다.

## 📋 기능

- ✅ 직원 목록 조회 및 검색
- ✅ AG-Grid 기반 데이터 표시
- ✅ 검색 필터 (직원번호, 직원명, 조직코드, 재직상태)
- ✅ 단일/다중 선택 모드 지원
- ✅ Row 더블클릭으로 빠른 선택
- ✅ 재직상태별 색상 구분 표시
- ✅ 반응형 디자인

## 🎨 사용 예시

### 기본 사용법

```tsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import { EmployeeSearchDialog } from '@/shared/components/organisms/EmployeeSearchDialog';
import { Employee } from '@/shared/types/employee';

const MyComponent: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  /**
   * 직원 선택 핸들러
   */
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    console.log('선택된 직원:', employee);
  };

  return (
    <div>
      {/* 직원 검색 버튼 */}
      <Button
        variant="contained"
        onClick={() => setDialogOpen(true)}
      >
        직원 검색
      </Button>

      {/* 선택된 직원 정보 표시 */}
      {selectedEmployee && (
        <div>
          <p>직원번호: {selectedEmployee.empNo}</p>
          <p>직원명: {selectedEmployee.empName}</p>
          <p>부점명: {selectedEmployee.orgName}</p>
          <p>직급: {selectedEmployee.jobGrade}</p>
        </div>
      )}

      {/* 직원 검색 다이얼로그 */}
      <EmployeeSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleEmployeeSelect}
      />
    </div>
  );
};

export default MyComponent;
```

### 초기 필터 설정

```tsx
<EmployeeSearchDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onSelect={handleEmployeeSelect}
  initialFilter={{
    employmentStatus: 'ACTIVE',  // 재직자만 표시
    orgCode: 'HEAD1010'          // 특정 조직만 표시
  }}
/>
```

### 커스텀 제목 및 다중 선택 모드

```tsx
<EmployeeSearchDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onSelect={handleEmployeeSelect}
  title="담당자 선택"
  singleSelection={false}  // 다중 선택 허용
/>
```

### Input 필드와 연동

```tsx
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { EmployeeSearchDialog } from '@/shared/components/organisms/EmployeeSearchDialog';
import { Employee } from '@/shared/types/employee';

const EmployeeInputField: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <>
      <TextField
        label="담당자"
        value={selectedEmployee ? `${selectedEmployee.empName} (${selectedEmployee.empNo})` : ''}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setDialogOpen(true)}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        placeholder="클릭하여 담당자 선택"
        onClick={() => setDialogOpen(true)}
      />

      <EmployeeSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleEmployeeSelect}
        title="담당자 선택"
      />
    </>
  );
};

export default EmployeeInputField;
```

### Form에서 사용

```tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { EmployeeSearchDialog } from '@/shared/components/organisms/EmployeeSearchDialog';
import { Employee } from '@/shared/types/employee';

interface FormData {
  title: string;
  manager: string;
  managerName: string;
}

const MyForm: React.FC = () => {
  const { control, handleSubmit, setValue } = useForm<FormData>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEmployeeSelect = (employee: Employee) => {
    setValue('manager', employee.empNo);
    setValue('managerName', employee.empName);
  };

  const onSubmit = (data: FormData) => {
    console.log('제출 데이터:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="제목" fullWidth />
        )}
      />

      <Controller
        name="managerName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="담당자"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setDialogOpen(true)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        )}
      />

      <Controller
        name="manager"
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <Button type="submit" variant="contained">
        저장
      </Button>

      <EmployeeSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleEmployeeSelect}
      />
    </form>
  );
};

export default MyForm;
```

## 📌 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | ✅ | - | 다이얼로그 열림 상태 |
| `onClose` | `() => void` | ✅ | - | 다이얼로그 닫기 핸들러 |
| `onSelect` | `EmployeeSelectCallback` | ✅ | - | 직원 선택 핸들러 |
| `initialFilter` | `Partial<EmployeeSearchFilter>` | ❌ | `{}` | 초기 검색 필터 |
| `title` | `string` | ❌ | `'직원 검색'` | 다이얼로그 제목 |
| `singleSelection` | `boolean` | ❌ | `true` | 단일 선택 모드 여부 |

## 📊 Grid 컬럼

| 컬럼명 | 필드 | 설명 |
|--------|------|------|
| 직원번호 | `empNo` | 직원 고유 번호 |
| 직원명 | `empName` | 직원 이름 |
| 부점명 | `orgName` | 소속 조직명 (JOIN) |
| 직급 | `jobGrade` | 직급 (예: 부장, 차장) |
| 상태 | `employmentStatus` | 재직상태 (재직/퇴사/휴직) |

## 🔍 검색 필터

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 직원번호 | `text` | LIKE 검색 |
| 직원명 | `text` | LIKE 검색 |
| 조직코드 | `text` | EQUAL 검색 |
| 재직상태 | `select` | EQUAL 검색 (전체/재직/퇴사/휴직) |

## 🎨 재직상태별 색상

- **재직 (ACTIVE)**: 녹색 (`$color-success-main`)
- **퇴사 (RESIGNED)**: 빨강 (`$color-error-main`)
- **휴직 (LEAVE)**: 주황 (`$color-warning-main`)

## 🔧 커스터마이징

### 검색 필터 추가

컴포넌트 내부의 `searchFields` 배열에 필터를 추가하세요:

```tsx
const searchFields = useMemo<FilterField[]>(() => [
  // 기존 필드...
  {
    key: 'jobGrade',
    type: 'select',
    label: '직급',
    options: [
      { value: '', label: '전체' },
      { value: '부장', label: '부장' },
      { value: '차장', label: '차장' },
      { value: '과장', label: '과장' }
    ],
    gridSize: { xs: 12, sm: 6, md: 3 }
  }
], []);
```

### Grid 컬럼 추가

`columnDefs` 배열에 컬럼을 추가하세요:

```tsx
const columnDefs = useMemo<ColDef<Employee>[]>(() => [
  // 기존 컬럼...
  {
    headerName: '이메일',
    field: 'email',
    width: 200,
    sortable: true,
    filter: true
  }
], []);
```

## 📝 TODO: Backend API 연동

현재는 Mock 데이터를 사용합니다. 실제 API 연동 시 다음 부분을 수정하세요:

```tsx
const fetchEmployees = useCallback(async () => {
  setLoading(true);
  try {
    // API 연동 (주석 해제)
    const response = await employeeApi.search(searchFilter);
    setEmployees(response.data);
  } catch (error) {
    console.error('직원 목록 조회 실패:', error);
    setEmployees([]);
  } finally {
    setLoading(false);
  }
}, [searchFilter]);
```

## 🔗 관련 파일

- **TypeScript 타입**: `src/shared/types/employee.ts`
- **컴포넌트**: `src/shared/components/organisms/EmployeeSearchDialog/EmployeeSearchDialog.tsx`
- **스타일**: `src/shared/components/organisms/EmployeeSearchDialog/EmployeeSearchDialog.module.scss`
- **API (예정)**: `src/shared/api/employeeApi.ts` (Backend 연동 시 생성 필요)

## 🚀 Next Steps

1. Backend API 개발 (`/api/employees/search`)
2. API 클라이언트 작성 (`employeeApi.ts`)
3. 컴포넌트에서 Mock 데이터 제거 및 실제 API 호출
4. 에러 처리 및 로딩 상태 개선
5. 페이지네이션 서버 사이드 처리
