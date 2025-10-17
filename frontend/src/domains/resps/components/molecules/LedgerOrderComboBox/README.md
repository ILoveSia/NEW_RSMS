# LedgerOrderComboBox 컴포넌트

원장차수 선택을 위한 공통 콤보박스 컴포넌트입니다.

## 📋 주요 기능

- ✅ **PROG, CLSD 상태만 조회**: 진행중과 종료 상태의 원장차수만 표시
- ✅ **자동 라벨 포맷팅**: PROG일 때 "[진행중]" 자동 표시
- ✅ **빈 데이터 처리**: 원장차수가 없을 때 "원장차수를 생성하세요" 메시지
- ✅ **로딩/에러 처리**: 자동 로딩 표시 및 에러 핸들링
- ✅ **TypeScript**: 완전한 타입 안전성

## 🎨 표시 형식

```
PROG: "20250001-1차점검이행[진행중]"
CLSD: "20250001-1차점검이행"
```

## 🚀 사용 방법

### 기본 사용

```tsx
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { useState } from 'react';

function MyComponent() {
  const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);

  return (
    <LedgerOrderComboBox
      value={ledgerOrderId}
      onChange={setLedgerOrderId}
      label="원장차수"
      required
    />
  );
}
```

### 폼 통합 사용 (React Hook Form)

```tsx
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  ledgerOrderId: string;
  // ... 기타 필드
}

function FormComponent() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('선택된 원장차수:', data.ledgerOrderId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="ledgerOrderId"
        control={control}
        rules={{ required: '원장차수를 선택하세요' }}
        render={({ field, fieldState }) => (
          <LedgerOrderComboBox
            value={field.value}
            onChange={field.onChange}
            label="원장차수"
            required
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <button type="submit">제출</button>
    </form>
  );
}
```

### 커스텀 스타일링

```tsx
<LedgerOrderComboBox
  value={ledgerOrderId}
  onChange={setLedgerOrderId}
  label="원장차수"
  size="small"
  fullWidth={false}
  className="custom-combo"
  placeholder="원장차수를 선택하세요"
/>
```

## 📝 Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | string \| undefined | - | ❌ | 선택된 원장차수ID |
| onChange | (value: string \| null) => void | - | ✅ | 선택 변경 핸들러 |
| label | string | "원장차수" | ❌ | 라벨 텍스트 |
| placeholder | string | "원장차수 선택" | ❌ | 플레이스홀더 텍스트 |
| required | boolean | false | ❌ | 필수 여부 |
| disabled | boolean | false | ❌ | 비활성화 여부 |
| error | boolean | false | ❌ | 에러 상태 |
| helperText | string | - | ❌ | 도움말 텍스트 |
| size | 'small' \| 'medium' | 'medium' | ❌ | 크기 |
| fullWidth | boolean | true | ❌ | 전체 너비 사용 여부 |
| className | string | - | ❌ | 추가 CSS 클래스명 |

## 🔌 백엔드 API

### 엔드포인트
```
GET /api/ledger-orders/combo
```

### 응답 예시
```json
[
  {
    "ledgerOrderId": "20250001",
    "ledgerOrderTitle": "1차점검이행",
    "ledgerOrderStatus": "PROG",
    "displayLabel": "20250001-1차점검이행[진행중]"
  },
  {
    "ledgerOrderId": "20250002",
    "ledgerOrderTitle": "2차점검이행",
    "ledgerOrderStatus": "CLSD",
    "displayLabel": "20250002-2차점검이행"
  }
]
```

### 빈 데이터 응답
```json
[]
```

## 🎯 상태 처리

### 로딩 중
- CircularProgress 표시
- "데이터 로딩 중..." 메시지

### 에러 발생
- Alert 컴포넌트로 에러 메시지 표시

### 데이터 없음
- Alert 컴포넌트로 "원장차수를 생성하세요" 메시지

## 🧪 테스트 방법

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LedgerOrderComboBox } from './LedgerOrderComboBox';

describe('LedgerOrderComboBox', () => {
  it('should render and select option', async () => {
    const handleChange = vi.fn();

    render(
      <LedgerOrderComboBox
        value={null}
        onChange={handleChange}
        label="원장차수"
      />
    );

    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.queryByText('데이터 로딩 중...')).not.toBeInTheDocument();
    });

    // 콤보박스 클릭
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);

    // 옵션 선택
    const option = screen.getByText(/20250001-1차점검이행/);
    await userEvent.click(option);

    // onChange 호출 확인
    expect(handleChange).toHaveBeenCalledWith('20250001');
  });
});
```

## 🔧 기술 스택

- **React 18**: 함수형 컴포넌트
- **TypeScript**: 완전한 타입 안전성
- **Material-UI**: Select, MenuItem 컴포넌트
- **TanStack Query**: 서버 상태 관리
- **CSS Modules**: 스타일 격리

## 📚 참고 자료

- [Material-UI Select 문서](https://mui.com/material-ui/react-select/)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [RSMS 프로젝트 가이드](../../../../../CLAUDE.md)
