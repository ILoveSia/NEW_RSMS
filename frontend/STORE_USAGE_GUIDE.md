# 로그인 정보 및 공통 데이터 사용 가이드

로그인 시 자동으로 로드되는 모든 정보를 `useAuthStore`, `useMenuStore`, `useCodeStore` 훅을 통해 접근할 수 있습니다.

---

## 📚 목차

1. [사용자 정보 (useAuthStore)](#1-사용자-정보-useauthstore)
2. [메뉴 정보 (useMenuStore)](#2-메뉴-정보-usemenustore)
3. [공통코드 (useCodeStore)](#3-공통코드-usecodestore)
4. [통합 활용 예시](#4-통합-활용-예시)

---

## 1. 사용자 정보 (useAuthStore)

### 기본 사용법

```typescript
import { useAuthStore } from '@/app/store/authStore';

const MyComponent: React.FC = () => {
  const { user, isAuthenticated, permissions, roleCodes } = useAuthStore();

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>
      <p>사용자명: {user?.empName}</p>
      <p>직원번호: {user?.empNo}</p>
      <p>이메일: {user?.email}</p>
      <p>역할: {roleCodes.join(', ')}</p>
    </div>
  );
};
```

### 권한 체크

```typescript
import { useAuthStore } from '@/app/store/authStore';

const ProtectedComponent: React.FC = () => {
  const { hasPermission, hasRole, hasRoleLevel } = useAuthStore();

  // 특정 권한 체크
  const canWrite = hasPermission('WRITE_USER');

  // 특정 역할 체크
  const isAdmin = hasRole('ADMIN');

  // 역할 레벨 체크 (1=최고 권한)
  const isManager = hasRoleLevel(3);

  return (
    <div>
      {canWrite && <button>등록</button>}
      {isAdmin && <button>관리자 메뉴</button>}
      {isManager && <button>승인</button>}
    </div>
  );
};
```

### 사용 가능한 필드

```typescript
{
  // 상태
  user: User | null,              // 사용자 정보
  isAuthenticated: boolean,        // 인증 여부
  isLoading: boolean,              // 로딩 상태
  sessionId: string | null,        // 세션 ID
  permissions: PermissionCode[],   // 권한 목록
  roleCodes: UserRoleCode[],       // 역할 코드 목록

  // 함수
  hasPermission: (permission: PermissionCode) => boolean,
  hasRole: (roleCode: UserRoleCode) => boolean,
  hasRoleLevel: (level: number) => boolean,
  getHighestRoleLevel: () => number,
  login: (user: User, sessionId: string) => void,
  logout: () => void
}
```

---

## 2. 메뉴 정보 (useMenuStore)

### 기본 사용법

```typescript
import { useMenuStore } from '@/app/store/menuStore';

const NavigationComponent: React.FC = () => {
  const { menus, isLoading, error } = useMenuStore();

  if (isLoading) return <div>메뉴 로딩 중...</div>;
  if (error) return <div>메뉴 로드 실패: {error}</div>;

  return (
    <nav>
      {menus.map(menu => (
        <div key={menu.id}>
          <a href={menu.path}>{menu.title}</a>
          {menu.children && (
            <ul>
              {menu.children.map(child => (
                <li key={child.id}>
                  <a href={child.path}>{child.title}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
};
```

### 메뉴 구조

```typescript
interface MenuItem {
  id: string;              // 메뉴 코드
  title: string;           // 메뉴명
  path?: string;           // URL 경로
  icon?: string;           // 아이콘
  permission?: string;     // 필요 권한
  children?: MenuItem[];   // 하위 메뉴
  menuType?: 'folder' | 'page';
  depth?: number;
  systemCode?: string;
  requiresAuth?: boolean;
}
```

---

## 3. 공통코드 (useCodeStore)

### 기본 사용법

```typescript
import { useCodeStore } from '@/app/store/codeStore';

const MyComponent: React.FC = () => {
  const {
    codeGroups,
    getCodeDetails,
    getCodeName,
    isLoading
  } = useCodeStore();

  // 특정 그룹의 코드 상세 목록 가져오기
  const statusCodes = getCodeDetails('STATUS');

  // 코드명 가져오기
  const statusName = getCodeName('STATUS', 'ACTIVE');

  return (
    <div>
      {statusCodes.map(code => (
        <option key={code.detailCode} value={code.detailCode}>
          {code.detailName}
        </option>
      ))}
    </div>
  );
};
```

### 헬퍼 함수 사용 (유틸리티)

```typescript
import { getCodeName, getCodeDetails } from '@/app/utils/initializeApp';

// 컴포넌트 외부에서도 사용 가능
const statusName = getCodeName('STATUS', 'ACTIVE');
const statusList = getCodeDetails('STATUS');
```

### Select 컴포넌트 예시

```typescript
import { useCodeStore } from '@/app/store/codeStore';

const StatusSelect: React.FC = () => {
  const { getCodeDetails } = useCodeStore();
  const statusCodes = getCodeDetails('STATUS');

  return (
    <select>
      <option value="">선택하세요</option>
      {statusCodes.map(code => (
        <option key={code.detailCode} value={code.detailCode}>
          {code.detailName}
        </option>
      ))}
    </select>
  );
};
```

### 코드명 표시 예시

```typescript
import { useCodeStore } from '@/app/store/codeStore';

interface DataGridProps {
  data: Array<{ status: string }>;
}

const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const { getCodeName } = useCodeStore();

  return (
    <table>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{getCodeName('STATUS', row.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## 4. 통합 활용 예시

### 예시 1: 권한에 따른 메뉴 필터링

```typescript
import { useAuthStore } from '@/app/store/authStore';
import { useMenuStore } from '@/app/store/menuStore';

const FilteredMenu: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const { menus } = useMenuStore();

  const filteredMenus = menus.filter(menu => {
    if (!menu.permission) return true;
    return hasPermission(menu.permission);
  });

  return (
    <nav>
      {filteredMenus.map(menu => (
        <a key={menu.id} href={menu.path}>
          {menu.title}
        </a>
      ))}
    </nav>
  );
};
```

### 예시 2: 사용자 정보 + 공통코드

```typescript
import { useAuthStore } from '@/app/store/authStore';
import { useCodeStore } from '@/app/store/codeStore';

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { getCodeName } = useCodeStore();

  if (!user) return null;

  return (
    <div>
      <p>이름: {user.empName}</p>
      <p>부서: {getCodeName('DEPT', user.deptCd || '')}</p>
      <p>직급: {getCodeName('POSITION', user.positionCd || '')}</p>
    </div>
  );
};
```

### 예시 3: 데이터 그리드에서 공통코드 표시

```typescript
import { useCodeStore } from '@/app/store/codeStore';
import { ColDef } from 'ag-grid-community';

const MyDataGrid: React.FC = () => {
  const { getCodeName } = useCodeStore();

  const columnDefs: ColDef[] = [
    { field: 'name', headerName: '이름' },
    {
      field: 'status',
      headerName: '상태',
      valueGetter: (params) => getCodeName('STATUS', params.data.status)
    },
    {
      field: 'deptCd',
      headerName: '부서',
      valueGetter: (params) => getCodeName('DEPT', params.data.deptCd)
    }
  ];

  return <BaseDataGrid columns={columnDefs} data={data} />;
};
```

---

## 🔄 자동 로드 및 초기화

### 로그인 시 (자동)
```typescript
// LoginPage에서 자동 실행
await initializeAppData();  // 공통코드 + 메뉴 로드
```

### 로그아웃 시 (자동)
```typescript
// authStore.logout()에서 자동 실행
clearAppData();  // 모든 스토어 초기화
```

### 수동 새로고침 (필요시)
```typescript
import { useMenuStore } from '@/app/store/menuStore';
import { useCodeStore } from '@/app/store/codeStore';

const RefreshButton: React.FC = () => {
  const { fetchMenus } = useMenuStore();
  const { fetchAllCodes } = useCodeStore();

  const handleRefresh = async () => {
    await Promise.all([
      fetchMenus(),
      fetchAllCodes()
    ]);
  };

  return <button onClick={handleRefresh}>데이터 새로고침</button>;
};
```

---

## 📝 주의사항

1. **로그인 후 자동 로드**: 로그인 성공 시 공통코드와 메뉴가 자동으로 로드됩니다.
2. **localStorage 저장**: 모든 데이터는 localStorage에 저장되어 새로고침 시에도 유지됩니다.
3. **로그아웃 시 초기화**: 로그아웃하면 모든 스토어 데이터가 자동으로 초기화됩니다.
4. **권한 체크**: 메뉴나 기능 접근 전 항상 권한을 체크하세요.
5. **로딩 상태**: 각 스토어의 `isLoading` 상태를 확인하여 로딩 UI를 표시하세요.

---

## 🎯 정리

로그인 후 모든 정보는 Zustand store에 저장되어 전역에서 사용할 수 있습니다:

- **사용자 정보**: `useAuthStore()` → user, permissions, roleCodes
- **메뉴 정보**: `useMenuStore()` → menus (계층 구조)
- **공통코드**: `useCodeStore()` → codeGroups, getCodeName(), getCodeDetails()

이제 필요한 곳 어디서든 훅을 import하여 바로 사용하면 됩니다! 🎉
