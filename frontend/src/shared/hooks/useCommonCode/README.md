# useCommonCode Hook 사용 가이드

공통코드(rsms-code-store)를 UI 컴포넌트에서 쉽게 사용하기 위한 커스텀 Hook입니다.

## 📦 기능

- ✅ 공통코드 조회 및 캐싱
- ✅ SelectBox/ComboBox용 옵션 변환
- ✅ "전체" 옵션 자동 추가
- ✅ 코드 ↔ 이름 양방향 변환
- ✅ 코드 존재 여부 확인
- ✅ 여러 그룹코드 일괄 조회

---

## 🚀 사용 예시

### 1️⃣ 기본 사용 - SelectBox

**기존 방식 (개선 전)**:
```tsx
const DeliberativeMgmt: React.FC = () => {
  const getCodeDetails = useCodeStore((state) => state.getCodeDetails);
  const holdingPeriodCodes = getCodeDetails('CFRN_CYCL_DVCD');

  const filterFields = useMemo<FilterField[]>(() => [
    {
      key: 'holdingPeriod',
      type: 'select',
      label: '개최주기',
      options: [
        { value: '', label: '전체' },
        ...holdingPeriodCodes.map(code => ({
          value: code.detailCode,
          label: code.detailName
        }))
      ]
    }
  ], [holdingPeriodCodes]);
};
```

**새로운 방식 (개선 후)**:
```tsx
import { useCommonCode } from '@/shared/hooks';

const DeliberativeMgmt: React.FC = () => {
  const holdingPeriod = useCommonCode('CFRN_CYCL_DVCD');

  const filterFields = useMemo<FilterField[]>(() => [
    {
      key: 'holdingPeriod',
      type: 'select',
      label: '개최주기',
      options: holdingPeriod.optionsWithAll  // 👈 간단!
    }
  ], [holdingPeriod.optionsWithAll]);
};
```

---

### 2️⃣ Material-UI Select 사용

```tsx
import { useCommonCode } from '@/shared/hooks';
import { Select, MenuItem } from '@mui/material';

const MyComponent: React.FC = () => {
  const { options } = useCommonCode('CFRN_CYCL_DVCD');
  const [value, setValue] = useState('');

  return (
    <Select value={value} onChange={(e) => setValue(e.target.value)}>
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

### 3️⃣ AG-Grid 컬럼 렌더러

**기존 방식**:
```tsx
const createHoldingPeriodRenderer = (holdingPeriodCodes: CommonCodeDetail[]) => {
  return ({ value }: { value: string }) => {
    const code = holdingPeriodCodes.find(c => c.detailCode === value);
    const displayText = code ? code.detailName : value;
    return <span>{displayText}</span>;
  };
};
```

**새로운 방식**:
```tsx
import { useCommonCode } from '@/shared/hooks';

const MyGrid: React.FC = () => {
  const { getCodeName } = useCommonCode('CFRN_CYCL_DVCD');

  const columns = useMemo(() => [
    {
      field: 'holdingPeriod',
      headerName: '개최주기',
      cellRenderer: ({ value }: any) => (
        <span>{getCodeName(value)}</span>  // 👈 간단!
      )
    }
  ], [getCodeName]);
};
```

---

### 4️⃣ 여러 그룹코드 한번에 조회

```tsx
import { useCommonCodes } from '@/shared/hooks';

const MyComponent: React.FC = () => {
  const codes = useCommonCodes({
    holdingPeriod: 'CFRN_CYCL_DVCD',
    committeeType: 'CMITE_DVCD',
    isActive: 'USE_YN'
  });

  return (
    <>
      <Select>
        {codes.holdingPeriod.options.map(opt => (
          <MenuItem value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>

      <Select>
        {codes.committeeType.optionsWithAll.map(opt => (
          <MenuItem value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>

      {/* 코드 → 이름 변환 */}
      <div>{codes.isActive.getCodeName('Y')}</div>  {/* "사용" */}
    </>
  );
};
```

---

### 5️⃣ Radio Button 사용

```tsx
import { useCommonCode } from '@/shared/hooks';
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';

const MyComponent: React.FC = () => {
  const { options } = useCommonCode('USE_YN');
  const [value, setValue] = useState('');

  return (
    <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
      {options.map(opt => (
        <FormControlLabel
          key={opt.value}
          value={opt.value}
          control={<Radio />}
          label={opt.label}
        />
      ))}
    </RadioGroup>
  );
};
```

---

### 6️⃣ 코드 존재 여부 확인

```tsx
import { useCommonCode } from '@/shared/hooks';

const MyComponent: React.FC = () => {
  const { hasCode, getCodeName } = useCommonCode('CFRN_CYCL_DVCD');

  const validateCode = (code: string) => {
    if (!hasCode(code)) {
      toast.error(`유효하지 않은 코드입니다: ${code}`);
      return false;
    }
    return true;
  };

  return (
    <div>
      {validateCode('MONTH') && (
        <span>{getCodeName('MONTH')}</span>
      )}
    </div>
  );
};
```

---

## 📚 API 레퍼런스

### `useCommonCode(groupCode, allLabel?)`

단일 그룹코드 조회

**Parameters:**
- `groupCode: string` - 공통코드 그룹코드 (예: 'CFRN_CYCL_DVCD')
- `allLabel?: string` - "전체" 옵션 라벨 (기본값: '전체')

**Returns:**
```typescript
{
  codes: CommonCodeDetail[];           // 원본 공통코드 목록
  options: CodeOption[];               // SelectBox용 옵션 (전체 제외)
  optionsWithAll: CodeOption[];        // SelectBox용 옵션 (전체 포함)
  getCodeName: (code: string) => string;     // 코드 → 이름 변환
  getCodeValue: (name: string) => string;    // 이름 → 코드 변환
  hasCode: (code: string) => boolean;        // 코드 존재 여부
}
```

---

### `useCommonCodes(groupCodes)`

여러 그룹코드 일괄 조회

**Parameters:**
```typescript
groupCodes: Record<string, string>
// 예: { holdingPeriod: 'CFRN_CYCL_DVCD', isActive: 'USE_YN' }
```

**Returns:**
```typescript
Record<keyof T, UseCommonCodeReturn>
// 각 키별로 useCommonCode 결과 반환
```

---

## 🎯 사용 권장 사항

1. ✅ **SelectBox/ComboBox**: `optionsWithAll` 또는 `options` 사용
2. ✅ **RadioButton/Checkbox**: `options` 사용
3. ✅ **AG-Grid 렌더러**: `getCodeName()` 사용
4. ✅ **코드 검증**: `hasCode()` 사용
5. ✅ **여러 코드 사용 시**: `useCommonCodes()` 사용

---

## ⚡ 성능 최적화

- 모든 반환값이 `useMemo`로 메모이제이션되어 있어 불필요한 재계산 방지
- rsms-code-store의 캐싱 기능을 활용하여 API 호출 최소화
- 여러 컴포넌트에서 같은 그룹코드 사용 시 자동으로 공유됨

---

## 🔄 리팩토링 가이드

기존 코드를 새로운 hook으로 변경하는 방법:

### Before
```tsx
const getCodeDetails = useCodeStore((state) => state.getCodeDetails);
const codes = getCodeDetails('CFRN_CYCL_DVCD');

const options = [
  { value: '', label: '전체' },
  ...codes.map(code => ({
    value: code.detailCode,
    label: code.detailName
  }))
];

const getDisplayName = (code: string) => {
  const found = codes.find(c => c.detailCode === code);
  return found ? found.detailName : code;
};
```

### After
```tsx
const { optionsWithAll, getCodeName } = useCommonCode('CFRN_CYCL_DVCD');
```

**변경 사항:**
- `getCodeDetails()` 호출 제거
- `map()` 변환 제거
- 커스텀 함수 제거
- 단 한 줄로 간소화!

---

## 📝 추가 예시 - 실전 시나리오

### 시나리오 1: 필터 검색 폼
```tsx
const SearchForm: React.FC = () => {
  const codes = useCommonCodes({
    period: 'CFRN_CYCL_DVCD',
    type: 'CMITE_DVCD',
    status: 'USE_YN'
  });

  return (
    <BaseSearchFilter
      fields={[
        {
          key: 'period',
          type: 'select',
          label: '개최주기',
          options: codes.period.optionsWithAll
        },
        {
          key: 'type',
          type: 'select',
          label: '구분',
          options: codes.type.optionsWithAll
        },
        {
          key: 'status',
          type: 'select',
          label: '상태',
          options: codes.status.optionsWithAll
        }
      ]}
    />
  );
};
```

### 시나리오 2: 폼 모달
```tsx
const FormModal: React.FC = () => {
  const { options } = useCommonCode('CFRN_CYCL_DVCD');
  const [formData, setFormData] = useState({ period: '' });

  return (
    <FormControl>
      <InputLabel>개최주기</InputLabel>
      <Select
        value={formData.period}
        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
      >
        {options.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

---

## 🚨 주의사항

1. **groupCode 오타 주의**: 잘못된 groupCode는 빈 배열 반환
2. **전체 옵션 필요 여부**: `options` vs `optionsWithAll` 선택
3. **useMemo 의존성**: 반환값들이 이미 메모이제이션되어 있으므로 추가 useMemo 불필요

---

## 💡 TIP

- 컴포넌트에서 공통코드를 사용할 때는 항상 이 hook 사용
- 직접 `useCodeStore`를 호출하지 말고 이 hook을 통해 사용
- 일관성 있는 코드 작성으로 유지보수성 향상
