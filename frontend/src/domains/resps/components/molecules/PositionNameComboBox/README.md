# PositionNameComboBox 컴포넌트

직책명 선택을 위한 공통 콤보박스 컴포넌트입니다.

## 📋 개요

- **데이터 소스**: `common_code_details` 테이블
- **Group Code**: `RSBT_RSOF_DVCD`
- **자동 정렬**: `sortOrder` 기준 오름차순
- **필터링**: `isActive = true`인 항목만 표시

## 🚀 사용법

### 기본 사용

```tsx
import { PositionNameComboBox } from '@/domains/resps/components/molecules/PositionNameComboBox';

const MyComponent = () => {
  const [positionName, setPositionName] = useState<string | null>(null);

  return (
    <PositionNameComboBox
      value={positionName}
      onChange={setPositionName}
      label="직책명"
      required
    />
  );
};
```

### 폼 통합 예제

```tsx
import { PositionNameComboBox } from '@/domains/resps/components/molecules/PositionNameComboBox';

const PositionForm = () => {
  const [formData, setFormData] = useState({
    positionName: '',
    headquarters: ''
  });

  const [errors, setErrors] = useState({
    positionName: ''
  });

  const handleChange = (field: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || ''
    }));
  };

  return (
    <form>
      <PositionNameComboBox
        value={formData.positionName}
        onChange={(value) => handleChange('positionName', value)}
        label="직책명"
        required
        error={!!errors.positionName}
        helperText={errors.positionName}
      />
    </form>
  );
};
```

## 📝 Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `value` | `string` | `undefined` | No | 선택된 직책명 |
| `onChange` | `(value: string \| null) => void` | - | Yes | 선택 변경 핸들러 |
| `label` | `string` | `'직책명'` | No | 라벨 텍스트 |
| `placeholder` | `string` | `'직책명 선택'` | No | 플레이스홀더 텍스트 |
| `required` | `boolean` | `false` | No | 필수 여부 |
| `disabled` | `boolean` | `false` | No | 비활성화 여부 |
| `error` | `boolean` | `false` | No | 에러 상태 |
| `helperText` | `string` | `undefined` | No | 도움말 텍스트 |
| `size` | `'small' \| 'medium'` | `'small'` | No | 크기 |
| `fullWidth` | `boolean` | `true` | No | 전체 너비 사용 여부 |
| `className` | `string` | `undefined` | No | 추가 CSS 클래스명 |

## 🔄 상태 처리

### 로딩 상태
- 데이터 로딩 중일 때 로딩 스피너와 메시지 표시
- 컴포넌트 자동으로 비활성화

### 에러 상태
- API 조회 실패 시 에러 Alert 표시
- 에러 메시지 자동으로 표시

### 빈 데이터
- 사용 가능한 직책명이 없을 때 경고 Alert 표시

## 🎨 스타일링

Material-UI의 `FormControl`, `Select` 컴포넌트 기반으로 제작되어 테마 시스템과 완벽하게 통합됩니다.

```tsx
// 커스텀 스타일 적용
<PositionNameComboBox
  className="my-custom-class"
  value={value}
  onChange={onChange}
/>
```

## 📊 데이터 구조

### API 응답 타입 (PositionNameDto)

```typescript
interface PositionNameDto {
  codeValue: string;    // 코드값 (예: 'RSOF001')
  codeName: string;     // 직책명 (예: '경영진단본부장')
  sortOrder: number;    // 정렬순서
  isActive: boolean;    // 사용여부
}
```

## 🔧 백엔드 연동

### API 엔드포인트
```
GET /api/common-codes?groupCode=RSBT_RSOF_DVCD
```

### 응답 예시
```json
[
  {
    "codeValue": "RSOF001",
    "codeName": "경영진단본부장",
    "sortOrder": 1,
    "isActive": true
  },
  {
    "codeValue": "RSOF002",
    "codeName": "총합기획부장",
    "sortOrder": 2,
    "isActive": true
  }
]
```

## 🧪 테스트

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PositionNameComboBox } from './PositionNameComboBox';

describe('PositionNameComboBox', () => {
  it('should render with loading state', () => {
    render(
      <PositionNameComboBox
        value={null}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('데이터 로딩 중...')).toBeInTheDocument();
  });

  it('should handle selection change', async () => {
    const handleChange = vi.fn();

    render(
      <PositionNameComboBox
        value={null}
        onChange={handleChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('데이터 로딩 중...')).not.toBeInTheDocument();
    });

    const select = screen.getByLabelText('직책명');
    await userEvent.click(select);

    const option = screen.getByText('경영진단본부장');
    await userEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('경영진단본부장');
  });
});
```

## 📦 의존성

- `@mui/material`: Material-UI 컴포넌트
- `@tanstack/react-query`: 데이터 페칭 및 캐싱
- `react`: ^18.3.1

## 🔗 관련 컴포넌트

- `LedgerOrderComboBox`: 원장차수 선택 콤보박스 (참고 템플릿)
- `HeadquartersComboBox`: 본부명 선택 콤보박스 (향후 구현)

## 📚 참고사항

- React Query로 데이터 캐싱 (5분간 fresh, 10분간 캐시 유지)
- 공통코드 변경 시 자동으로 최신 데이터 반영
- 여러 화면에서 재사용 가능한 공통 컴포넌트
