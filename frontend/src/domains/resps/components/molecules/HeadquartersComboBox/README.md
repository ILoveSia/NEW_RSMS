# HeadquartersComboBox 컴포넌트

본부명 선택을 위한 재사용 가능한 공통 콤보박스 컴포넌트입니다.

## 📋 개요

- **데이터 소스**: `common_code_details` 테이블 (`group_code = 'DPRM_CD'`)
- **자동 기능**: 로딩/에러 상태 처리, 정렬, 캐싱
- **재사용**: 여러 화면에서 공통으로 사용 가능

## 🎯 주요 특징

- ✅ 사용 가능한 본부명만 자동 필터링 (`isActive = true`)
- ✅ 정렬순서(`sortOrder`)로 자동 정렬
- ✅ TanStack Query 캐싱 (5분 fresh, 10분 메모리 유지)
- ✅ 로딩/에러 상태 자동 처리
- ✅ Material-UI 표준 Props 지원
- ✅ TypeScript 완전 타입 지원

## 📦 설치 및 Import

```tsx
import HeadquartersComboBox from '@/domains/resps/components/molecules/HeadquartersComboBox';
```

## 🚀 사용 예시

### 기본 사용법

```tsx
import { useState } from 'react';
import HeadquartersComboBox from '@/domains/resps/components/molecules/HeadquartersComboBox';

const MyComponent = () => {
  const [headquarters, setHeadquarters] = useState<string | null>(null);

  return (
    <HeadquartersComboBox
      value={headquarters}
      onChange={setHeadquarters}
      label="본부명"
    />
  );
};
```

### 필수 입력 + 에러 처리

```tsx
<HeadquartersComboBox
  value={headquarters}
  onChange={setHeadquarters}
  label="본부명"
  required
  error={!headquarters}
  helperText={!headquarters ? '본부명을 선택해주세요' : ''}
/>
```

### 커스텀 라벨 + 플레이스홀더

```tsx
<HeadquartersComboBox
  value={headquarters}
  onChange={setHeadquarters}
  label="소속 본부"
  placeholder="본부를 선택하세요"
  fullWidth
  size="medium"
/>
```

### React Hook Form과 함께 사용

```tsx
import { useForm, Controller } from 'react-hook-form';

const MyForm = () => {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="headquarters"
        control={control}
        rules={{ required: '본부명을 선택해주세요' }}
        render={({ field, fieldState }) => (
          <HeadquartersComboBox
            value={field.value}
            onChange={field.onChange}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            required
          />
        )}
      />
    </form>
  );
};
```

## 📝 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | `string \| undefined` | - | 선택된 본부명 |
| `onChange` | `(value: string \| null) => void` | - | 선택 변경 핸들러 (필수) |
| `label` | `string` | `'본부명'` | 라벨 텍스트 |
| `placeholder` | `string` | `'본부명 선택'` | 플레이스홀더 텍스트 |
| `required` | `boolean` | `false` | 필수 입력 여부 |
| `disabled` | `boolean` | `false` | 비활성화 여부 |
| `error` | `boolean` | `false` | 에러 상태 |
| `helperText` | `string` | - | 도움말 텍스트 |
| `size` | `'small' \| 'medium'` | `'small'` | 크기 |
| `fullWidth` | `boolean` | `true` | 전체 너비 사용 여부 |
| `className` | `string` | - | 추가 CSS 클래스명 |

## 🎨 상태별 UI

### 로딩 상태
- CircularProgress 표시
- "데이터 로딩 중..." 메시지

### 에러 상태
- Error Alert 표시
- 에러 메시지 포함

### 데이터 없음
- Warning Alert 표시
- "본부명 데이터가 없습니다." 메시지

### 정상 상태
- 본부명 리스트를 드롭다운으로 표시
- 정렬순서대로 정렬됨

## 🔧 커스터마이징

### API 연동

`services/headquartersService.ts` 파일에서 실제 API 호출로 교체:

```typescript
export const getHeadquartersForComboBox = async (): Promise<HeadquartersDto[]> => {
  const response = await fetch('/api/common-codes?groupCode=DPRM_CD');
  const data = await response.json();
  return data;
};
```

### 캐시 시간 조정

`hooks/useHeadquarters.ts` 파일에서 캐시 시간 변경:

```typescript
export const useHeadquartersForComboBox = (): UseQueryResult<HeadquartersDto[], Error> => {
  return useQuery({
    queryKey: ['headquarters', 'combo'],
    queryFn: getHeadquartersForComboBox,
    staleTime: 10 * 60 * 1000, // 10분으로 변경
    gcTime: 30 * 60 * 1000,    // 30분으로 변경
  });
};
```

## 📂 파일 구조

```
HeadquartersComboBox/
├── HeadquartersComboBox.tsx   # 메인 컴포넌트
├── types.ts                   # TypeScript 타입 정의
├── index.ts                   # Export
└── README.md                  # 이 문서

../services/
└── headquartersService.ts     # API 서비스

../hooks/
└── useHeadquarters.ts         # React Query 훅
```

## 🧪 테스트

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeadquartersComboBox from './HeadquartersComboBox';

describe('HeadquartersComboBox', () => {
  it('본부명 리스트가 정상적으로 렌더링된다', async () => {
    const onChange = vi.fn();
    render(<HeadquartersComboBox value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('경영본부')).toBeInTheDocument();
    });
  });

  it('본부명 선택 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    render(<HeadquartersComboBox value={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('경영본부'));

    expect(onChange).toHaveBeenCalledWith('경영본부');
  });
});
```

## 🔗 관련 컴포넌트

- **PositionNameComboBox**: 직책명 선택 콤보박스
- **BaseSearchFilter**: 검색 필터 컴포넌트

## 📞 문의

컴포넌트 관련 문의사항은 개발팀에 문의하세요.
