# useOrganization Hook 사용 가이드

조직 데이터(rsms-organization-store)를 UI 컴포넌트에서 쉽게 사용하기 위한 커스텀 Hook입니다.

`useCommonCode`와 동일한 패턴으로 설계되어 일관성 있게 사용할 수 있습니다.

## 📦 기능

- ✅ 조직 데이터 조회 및 캐싱
- ✅ SelectBox/ComboBox용 옵션 변환
- ✅ "전체" 옵션 자동 추가
- ✅ 조직코드 ↔ 조직명 양방향 변환
- ✅ 조직 유형별 필터링 (head, dept, branch)
- ✅ 본부별 필터링
- ✅ 전용 Hook 제공 (본부, 부서, 영업점)

---

## 🚀 사용 예시

### 1️⃣ 기본 사용 - 모든 조직 조회

```tsx
import { useOrganization } from '@/shared/hooks';

const MyComponent: React.FC = () => {
  const { options } = useOrganization();

  return (
    <Select>
      {options.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### 2️⃣ 본부만 조회 (useHeadquarters)

```tsx
import { useHeadquarters } from '@/shared/hooks';

const HeadquarterSelect: React.FC = () => {
  const { optionsWithAll } = useHeadquarters('전체 본부');

  return (
    <Select>
      {optionsWithAll.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### 3️⃣ 부서만 조회 (useDepartments)

```tsx
import { useDepartments } from '@/shared/hooks';

const DepartmentSelect: React.FC = () => {
  const [hqCode, setHqCode] = useState('1010');

  // 본부코드별 부서 필터링
  const { options } = useDepartments(hqCode);

  return (
    <Select>
      {options.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### 4️⃣ 영업점만 조회 (useBranches)

```tsx
import { useBranches } from '@/shared/hooks';

const BranchSelect: React.FC = () => {
  const { optionsWithAll } = useBranches('1010', '전체 영업점');

  return (
    <Select>
      {optionsWithAll.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### 5️⃣ 조직코드 → 조직명 변환

```tsx
import { useOrganization } from '@/shared/hooks';

const OrgDisplay: React.FC<{ orgCode: string }> = ({ orgCode }) => {
  const { getOrgName } = useOrganization();

  return <div>{getOrgName(orgCode)}</div>;  // "서울경영전략부"
};
```

---

### 6️⃣ AG-Grid 렌더러에서 사용

```tsx
import { useOrganization } from '@/shared/hooks';

const MyGrid: React.FC = () => {
  const { getOrgName } = useOrganization();

  const columns = useMemo(() => [
    {
      field: 'orgCode',
      headerName: '조직',
      cellRenderer: ({ value }: any) => (
        <span>{getOrgName(value)}</span>
      )
    }
  ], [getOrgName]);

  return <BaseDataGrid columns={columns} />;
};
```

---

### 7️⃣ 검색 필터에서 사용

```tsx
import { useOrganization } from '@/shared/hooks';

const SearchForm: React.FC = () => {
  const { optionsWithAll } = useOrganization({ orgType: 'dept' });

  const searchFields = useMemo(() => [
    {
      key: 'orgCode',
      type: 'select',
      label: '부서',
      options: optionsWithAll  // 👈 간단!
    }
  ], [optionsWithAll]);

  return <BaseSearchFilter fields={searchFields} />;
};
```

---

### 8️⃣ 조건부 조회 (본부 선택 후 부서 표시)

```tsx
import { useHeadquarters, useDepartments } from '@/shared/hooks';

const HierarchySelect: React.FC = () => {
  const [selectedHqCode, setSelectedHqCode] = useState('');

  const headquarters = useHeadquarters();
  const departments = useDepartments(selectedHqCode);

  return (
    <>
      {/* 본부 선택 */}
      <Select
        value={selectedHqCode}
        onChange={(e) => setSelectedHqCode(e.target.value)}
      >
        {headquarters.optionsWithAll.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* 선택된 본부의 부서 표시 */}
      {selectedHqCode && (
        <Select>
          {departments.options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </>
  );
};
```

---

### 9️⃣ 조직 존재 여부 확인

```tsx
import { useOrganization } from '@/shared/hooks';

const MyComponent: React.FC = () => {
  const { hasOrg, getOrgName } = useOrganization();

  const validateOrg = (orgCode: string) => {
    if (!hasOrg(orgCode)) {
      toast.error(`유효하지 않은 조직코드입니다: ${orgCode}`);
      return false;
    }
    return true;
  };

  return (
    <div>
      {validateOrg('DEPT001') && (
        <span>{getOrgName('DEPT001')}</span>
      )}
    </div>
  );
};
```

---

### 🔟 조직 객체 전체 조회

```tsx
import { useOrganization } from '@/shared/hooks';

const OrgDetail: React.FC<{ orgCode: string }> = ({ orgCode }) => {
  const { getOrganization } = useOrganization();
  const org = getOrganization(orgCode);

  if (!org) return <div>조직을 찾을 수 없습니다.</div>;

  return (
    <div>
      <div>조직코드: {org.orgCode}</div>
      <div>조직명: {org.orgName}</div>
      <div>본부코드: {org.hqCode}</div>
      <div>조직유형: {org.orgType}</div>
      <div>사용여부: {org.isActive}</div>
    </div>
  );
};
```

---

## 📚 API 레퍼런스

### `useOrganization(options?)`

모든 조직 또는 필터링된 조직 조회

**Parameters:**
```typescript
interface UseOrganizationOptions {
  orgType?: string;      // 조직 유형 ('head', 'dept', 'branch')
  hqCode?: string;       // 본부코드
  allLabel?: string;     // "전체" 옵션 라벨 (기본값: '전체')
}
```

**Returns:**
```typescript
{
  organizations: Organization[];           // 원본 조직 목록 (필터 적용됨)
  options: OrgOption[];                    // SelectBox용 옵션 (전체 제외)
  optionsWithAll: OrgOption[];             // SelectBox용 옵션 (전체 포함)
  getOrgName: (orgCode: string) => string;         // 조직코드 → 조직명
  getOrgCode: (orgName: string) => string;         // 조직명 → 조직코드
  hasOrg: (orgCode: string) => boolean;            // 조직 존재 여부
  getOrganization: (orgCode: string) => Organization | undefined;  // 조직 객체 조회
}
```

---

### `useHeadquarters(allLabel?)`

본부만 조회 (orgType='head')

**Parameters:**
- `allLabel?: string` - "전체" 옵션 라벨 (기본값: '전체')

**Returns:** `UseOrganizationReturn`

---

### `useDepartments(hqCode?, allLabel?)`

부서만 조회 (orgType='dept')

**Parameters:**
- `hqCode?: string` - 본부코드 (옵션)
- `allLabel?: string` - "전체" 옵션 라벨 (기본값: '전체')

**Returns:** `UseOrganizationReturn`

---

### `useBranches(hqCode?, allLabel?)`

영업점만 조회 (orgType='branch')

**Parameters:**
- `hqCode?: string` - 본부코드 (옵션)
- `allLabel?: string` - "전체" 옵션 라벨 (기본값: '전체')

**Returns:** `UseOrganizationReturn`

---

## 🎯 사용 권장 사항

1. ✅ **본부 SelectBox**: `useHeadquarters()` 사용
2. ✅ **부서 SelectBox**: `useDepartments(hqCode)` 사용
3. ✅ **영업점 SelectBox**: `useBranches(hqCode)` 사용
4. ✅ **전체 조직 SelectBox**: `useOrganization()` 사용
5. ✅ **AG-Grid 렌더러**: `getOrgName()` 사용
6. ✅ **조직 검증**: `hasOrg()` 사용

---

## ⚡ 성능 최적화

- 모든 반환값이 `useMemo`로 메모이제이션되어 불필요한 재계산 방지
- rsms-organization-store의 캐싱 기능 활용 (로그인 시 1회만 로드)
- 여러 컴포넌트에서 같은 조직 데이터 사용 시 자동으로 공유됨

---

## 🔄 리팩토링 가이드

기존 코드를 새로운 hook으로 변경하는 방법:

### Before
```tsx
const { organizations } = useOrganizationStore();

const deptOptions = [
  { value: '', label: '전체' },
  ...organizations
    .filter(org => org.orgType === 'dept')
    .map(org => ({
      value: org.orgCode,
      label: org.orgName
    }))
];

const getOrgName = (orgCode: string) => {
  const org = organizations.find(o => o.orgCode === orgCode);
  return org ? org.orgName : orgCode;
};
```

### After
```tsx
const { optionsWithAll, getOrgName } = useDepartments();
```

**변경 사항:**
- `useOrganizationStore()` 호출 제거
- `filter()` + `map()` 변환 제거
- 커스텀 함수 제거
- 단 한 줄로 간소화!

---

## 💡 실전 시나리오

### 시나리오 1: 본부-부서 계층 구조 SelectBox
```tsx
const HierarchicalOrgSelect: React.FC = () => {
  const [hqCode, setHqCode] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const hq = useHeadquarters();
  const dept = useDepartments(hqCode);

  return (
    <>
      {/* 본부 선택 */}
      <FormControl>
        <InputLabel>본부</InputLabel>
        <Select
          value={hqCode}
          onChange={(e) => {
            setHqCode(e.target.value);
            setDeptCode(''); // 본부 변경 시 부서 초기화
          }}
        >
          {hq.optionsWithAll.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 부서 선택 (본부 선택 후 활성화) */}
      <FormControl disabled={!hqCode}>
        <InputLabel>부서</InputLabel>
        <Select value={deptCode} onChange={(e) => setDeptCode(e.target.value)}>
          {dept.optionsWithAll.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
```

### 시나리오 2: 검색 폼
```tsx
const SearchForm: React.FC = () => {
  const hq = useHeadquarters();
  const dept = useDepartments();
  const branch = useBranches();

  const searchFields = useMemo(() => [
    {
      key: 'hqCode',
      type: 'select',
      label: '본부',
      options: hq.optionsWithAll
    },
    {
      key: 'deptCode',
      type: 'select',
      label: '부서',
      options: dept.optionsWithAll
    },
    {
      key: 'branchCode',
      type: 'select',
      label: '영업점',
      options: branch.optionsWithAll
    }
  ], [hq.optionsWithAll, dept.optionsWithAll, branch.optionsWithAll]);

  return <BaseSearchFilter fields={searchFields} />;
};
```

### 시나리오 3: 데이터 테이블 표시
```tsx
const OrgTable: React.FC = () => {
  const { getOrgName } = useOrganization();

  const columns = useMemo(() => [
    {
      field: 'orgCode',
      headerName: '조직',
      cellRenderer: ({ value }: any) => <span>{getOrgName(value)}</span>
    }
  ], [getOrgName]);

  return <BaseDataGrid columns={columns} data={data} />;
};
```

---

## 🚨 주의사항

1. **로그인 필수**: 조직 데이터는 로그인 시 로드되므로 로그인 전에는 빈 배열 반환
2. **필터 조합**: `orgType`과 `hqCode` 필터를 동시에 사용 가능
3. **전용 Hook 우선**: 가능하면 `useHeadquarters`, `useDepartments`, `useBranches` 사용 권장

---

## 📊 비교: useCommonCode vs useOrganization

| 기능 | useCommonCode | useOrganization |
|------|--------------|-----------------|
| 데이터 소스 | common_code_details | organizations |
| 필터링 | groupCode | orgType, hqCode |
| 전용 Hook | ❌ | ✅ (본부, 부서, 영업점) |
| 사용 패턴 | 동일 | 동일 |

---

## 💡 TIP

- 컴포넌트에서 조직 데이터 사용 시 항상 이 hook 사용
- 직접 `useOrganizationStore`를 호출하지 말고 이 hook을 통해 사용
- 일관성 있는 코드 작성으로 유지보수성 향상
- `useCommonCode`와 동일한 패턴이므로 학습 곡선 없음
