# Validation Utility 사용 가이드

Frontend의 입력 필드, 폼 검증을 위한 공통 Validation 유틸리티 사용 가이드입니다.

## 목차
- [기본 사용법](#기본-사용법)
- [제공되는 Validators](#제공되는-validators)
- [Custom Hook (useValidation)](#custom-hook-usevalidation)
- [실전 예제](#실전-예제)

---

## 기본 사용법

### 1. Import

```tsx
import { validators, useValidation } from '@/shared/utils/validation';
// 또는
import { required, email, minLength } from '@/shared/utils/validation';
```

### 2. 단일 필드 검증

```tsx
import { validators } from '@/shared/utils/validation';

// 이메일 검증
const emailResult = validators.email()('test@example.com');
console.log(emailResult); // { isValid: true }

const invalidEmailResult = validators.email()('invalid-email');
console.log(invalidEmailResult); // { isValid: false, message: '올바른 이메일 형식이 아닙니다' }

// 필수 입력 검증
const requiredResult = validators.required()('');
console.log(requiredResult); // { isValid: false, message: '필수 입력 항목입니다' }
```

### 3. 여러 규칙 조합

```tsx
import { validators } from '@/shared/utils/validation';

const passwordRules = [
  validators.required('비밀번호를 입력해주세요'),
  validators.minLength(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  validators.password({
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  })
];

// 검증 실행
for (const rule of passwordRules) {
  const result = rule('myPassword123');
  if (!result.isValid) {
    console.error(result.message);
    break;
  }
}
```

---

## 제공되는 Validators

### 기본 Validators

#### `required(message?: string)`
필수 입력 검증

```tsx
validators.required()('') // { isValid: false, message: '필수 입력 항목입니다' }
validators.required('이름을 입력해주세요')('') // { isValid: false, message: '이름을 입력해주세요' }
```

#### `minLength(min: number, message?: string)`
최소 길이 검증

```tsx
validators.minLength(5)('abc') // { isValid: false, message: '최소 5자 이상 입력해주세요' }
validators.minLength(5)('abcdef') // { isValid: true }
```

#### `maxLength(max: number, message?: string)`
최대 길이 검증

```tsx
validators.maxLength(10)('12345678901') // { isValid: false, message: '최대 10자까지 입력 가능합니다' }
```

#### `min(minValue: number, message?: string)`
최소값 검증

```tsx
validators.min(18)('17') // { isValid: false, message: '최소값은 18입니다' }
validators.min(18)('20') // { isValid: true }
```

#### `max(maxValue: number, message?: string)`
최대값 검증

```tsx
validators.max(100)('101') // { isValid: false, message: '최대값은 100입니다' }
```

#### `pattern(regex: RegExp, message?: string)`
정규식 패턴 검증

```tsx
const onlyNumbers = validators.pattern(/^\d+$/, '숫자만 입력 가능합니다');
onlyNumbers('abc') // { isValid: false, message: '숫자만 입력 가능합니다' }
```

### 문자열 Validators

#### `email(message?: string)`
이메일 형식 검증

```tsx
validators.email()('test@example.com') // { isValid: true }
validators.email()('invalid-email') // { isValid: false }
```

#### `numeric(message?: string)`
숫자만 검증

```tsx
validators.numeric()('12345') // { isValid: true }
validators.numeric()('abc123') // { isValid: false }
```

#### `alpha(message?: string)`
영문자만 검증

```tsx
validators.alpha()('abcDEF') // { isValid: true }
validators.alpha()('abc123') // { isValid: false }
```

#### `alphanumeric(message?: string)`
영문자+숫자 검증

```tsx
validators.alphanumeric()('abc123DEF') // { isValid: true }
validators.alphanumeric()('abc-123') // { isValid: false }
```

### 한국 특화 Validators

#### `phoneNumber(message?: string)`
전화번호 검증 (한국)

```tsx
validators.phoneNumber()('010-1234-5678') // { isValid: true }
validators.phoneNumber()('02-1234-5678') // { isValid: true }
validators.phoneNumber()('031-123-4567') // { isValid: true }
validators.phoneNumber()('invalid') // { isValid: false }
```

#### `mobileNumber(message?: string)`
휴대폰 번호 검증

```tsx
validators.mobileNumber()('010-1234-5678') // { isValid: true }
validators.mobileNumber()('011-1234-5678') // { isValid: true }
validators.mobileNumber()('02-1234-5678') // { isValid: false }
```

#### `businessNumber(message?: string)`
사업자등록번호 검증 (체크섬 포함)

```tsx
validators.businessNumber()('123-45-67890') // 체크섬 검증
validators.businessNumber()('1234567890') // 하이픈 없이도 가능
```

#### `birthDate(message?: string)`
생년월일 검증 (YYMMDD)

```tsx
validators.birthDate()('901231') // { isValid: true }
validators.birthDate()('001301') // { isValid: false, message: '올바른 월을 입력해주세요 (01-12)' }
```

### 날짜 Validators

#### `date(options?: DateValidationOptions)`
날짜 검증

```tsx
// 미래 날짜 불가
validators.date({ allowFuture: false })(new Date('2099-12-31'))
// { isValid: false, message: '미래 날짜는 선택할 수 없습니다' }

// 과거 날짜 불가
validators.date({ allowPast: false })(new Date('2020-01-01'))
// { isValid: false, message: '과거 날짜는 선택할 수 없습니다' }

// 날짜 범위 제한
validators.date({
  minDate: '2024-01-01',
  maxDate: '2024-12-31'
})(new Date('2024-06-15')) // { isValid: true }
```

#### `dateRange(startDate, endDate, message?: string)`
날짜 범위 검증

```tsx
validators.dateRange('2024-01-01', '2024-12-31')
// { isValid: true }

validators.dateRange('2024-12-31', '2024-01-01')
// { isValid: false, message: '시작일은 종료일보다 이전이어야 합니다' }
```

### 보안 Validators

#### `password(options?: PasswordValidationOptions)`
비밀번호 강도 검증

```tsx
validators.password({
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
})('Abc123!@') // { isValid: true }

validators.password({
  minLength: 8
})('short') // { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다' }
```

#### `passwordConfirm(originalPassword, message?: string)`
비밀번호 확인 검증

```tsx
const originalPassword = 'myPassword123';
validators.passwordConfirm(originalPassword)('myPassword123') // { isValid: true }
validators.passwordConfirm(originalPassword)('different') // { isValid: false }
```

### 파일 Validators

#### `file(options?: FileValidationOptions)`
파일 검증

```tsx
validators.file({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
  maxFiles: 3
})(fileInput.files)
```

### 기타 Validators

#### `url(message?: string)`
URL 형식 검증

```tsx
validators.url()('https://example.com') // { isValid: true }
validators.url()('invalid-url') // { isValid: false }
```

#### `custom(validationFn, message?: string)`
커스텀 검증 함수

```tsx
const isEvenNumber = validators.custom(
  (value) => Number(value) % 2 === 0,
  '짝수만 입력 가능합니다'
);

isEvenNumber('4') // { isValid: true }
isEvenNumber('3') // { isValid: false, message: '짝수만 입력 가능합니다' }
```

---

## Custom Hook (useValidation)

React 컴포넌트에서 편리하게 사용할 수 있는 Custom Hook입니다.

### 기본 사용법

```tsx
import React, { useState } from 'react';
import { useValidation, validators } from '@/shared/utils/validation';

const MyForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation Hook 초기화
  const { errors, touched, validate, validateForm, setFieldTouched } = useValidation({
    email: [validators.required('이메일을 입력해주세요'), validators.email()],
    password: [
      validators.required('비밀번호를 입력해주세요'),
      validators.minLength(8)
    ],
    confirmPassword: [
      validators.required('비밀번호 확인을 입력해주세요'),
      validators.passwordConfirm(formData.password, '비밀번호가 일치하지 않습니다')
    ]
  });

  // 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 실시간 검증
    if (touched[name]) {
      validate(name, value);
    }
  };

  // 필드 포커스 아웃 핸들러
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldTouched(name, true);
    validate(name, value);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateForm(formData);

    if (result.isValid) {
      console.log('폼 제출:', formData);
      // API 호출 등...
    } else {
      console.error('검증 실패:', result.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit">제출</button>
    </form>
  );
};
```

### Hook API

#### `errors`
필드별 에러 메시지 객체

```tsx
errors: {
  email: '올바른 이메일 형식이 아닙니다',
  password: '비밀번호는 최소 8자 이상이어야 합니다'
}
```

#### `touched`
필드별 터치 여부 객체

```tsx
touched: {
  email: true,
  password: false
}
```

#### `isValid`
전체 폼이 유효한지 여부

```tsx
const { isValid } = useValidation(rules);
console.log(isValid); // true or false
```

#### `validate(fieldName, value)`
단일 필드 검증

```tsx
const result = validate('email', 'test@example.com');
console.log(result); // { isValid: true }
```

#### `validateForm(data)`
전체 폼 검증

```tsx
const result = validateForm({
  email: 'test@example.com',
  password: 'myPassword123'
});

console.log(result);
// {
//   isValid: true,
//   errors: {},
//   firstErrorField: undefined
// }
```

#### `setFieldTouched(fieldName, touched?)`
필드 터치 상태 설정

```tsx
setFieldTouched('email', true);
```

#### `setFieldError(fieldName, error)`
필드 에러 직접 설정

```tsx
setFieldError('email', '이미 사용중인 이메일입니다');
```

#### `clearErrors()`
모든 에러 초기화

```tsx
clearErrors();
```

#### `clearFieldError(fieldName)`
특정 필드 에러 초기화

```tsx
clearFieldError('email');
```

#### `touchAll()`
모든 필드를 터치 상태로 설정

```tsx
touchAll();
```

#### `reset()`
전체 초기화 (errors, touched 모두 초기화)

```tsx
reset();
```

---

## 실전 예제

### 예제 1: 사용자 등록 폼

```tsx
import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useValidation, validators } from '@/shared/utils/validation';

const UserRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const { errors, touched, validate, validateForm, setFieldTouched } = useValidation({
    username: [
      validators.required('사용자명을 입력해주세요'),
      validators.minLength(3, '사용자명은 최소 3자 이상이어야 합니다'),
      validators.maxLength(20, '사용자명은 최대 20자까지 가능합니다'),
      validators.alphanumeric('영문자와 숫자만 입력 가능합니다')
    ],
    email: [
      validators.required('이메일을 입력해주세요'),
      validators.email()
    ],
    phoneNumber: [
      validators.required('휴대폰 번호를 입력해주세요'),
      validators.mobileNumber()
    ],
    password: [
      validators.required('비밀번호를 입력해주세요'),
      validators.password({
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true
      })
    ],
    confirmPassword: [
      validators.required('비밀번호 확인을 입력해주세요'),
      validators.passwordConfirm(formData.password)
    ],
    birthDate: [
      validators.required('생년월일을 입력해주세요'),
      validators.birthDate()
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldTouched(name, true);
    validate(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateForm(formData);

    if (result.isValid) {
      console.log('사용자 등록:', formData);
      // API 호출...
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="사용자명"
        name="username"
        value={formData.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.username && !!errors.username}
        helperText={touched.username && errors.username}
      />

      <TextField
        fullWidth
        label="이메일"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && !!errors.email}
        helperText={touched.email && errors.email}
      />

      <TextField
        fullWidth
        label="휴대폰 번호"
        name="phoneNumber"
        placeholder="010-1234-5678"
        value={formData.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phoneNumber && !!errors.phoneNumber}
        helperText={touched.phoneNumber && errors.phoneNumber}
      />

      <TextField
        fullWidth
        label="비밀번호"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && !!errors.password}
        helperText={touched.password && errors.password}
      />

      <TextField
        fullWidth
        label="비밀번호 확인"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && !!errors.confirmPassword}
        helperText={touched.confirmPassword && errors.confirmPassword}
      />

      <TextField
        fullWidth
        label="생년월일"
        name="birthDate"
        placeholder="YYMMDD (예: 901231)"
        value={formData.birthDate}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.birthDate && !!errors.birthDate}
        helperText={touched.birthDate && errors.birthDate}
      />

      <Button type="submit" variant="contained" color="primary">
        등록
      </Button>
    </form>
  );
};

export default UserRegistrationForm;
```

### 예제 2: 날짜 범위 검증

```tsx
import React, { useState } from 'react';
import { useValidation, validators } from '@/shared/utils/validation';

const DateRangeForm: React.FC = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });

  const { errors, validate, validateForm } = useValidation({
    startDate: [
      validators.required('시작일을 선택해주세요'),
      validators.date({ allowFuture: true })
    ],
    endDate: [
      validators.required('종료일을 선택해주세요'),
      validators.date({ allowFuture: true })
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateForm(formData);

    if (result.isValid) {
      // 날짜 범위 추가 검증
      const rangeResult = validators.dateRange(
        formData.startDate,
        formData.endDate
      );

      if (!rangeResult.isValid) {
        alert(rangeResult.message);
        return;
      }

      console.log('검색:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, startDate: e.target.value }));
          validate('startDate', e.target.value);
        }}
      />
      {errors.startDate && <span>{errors.startDate}</span>}

      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, endDate: e.target.value }));
          validate('endDate', e.target.value);
        }}
      />
      {errors.endDate && <span>{errors.endDate}</span>}

      <button type="submit">검색</button>
    </form>
  );
};
```

### 예제 3: 파일 업로드 검증

```tsx
import React, { useState } from 'react';
import { useValidation, validators } from '@/shared/utils/validation';

const FileUploadForm: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);

  const { errors, validate } = useValidation({
    files: [
      validators.required('파일을 선택해주세요'),
      validators.file({
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxFiles: 5
      })
    ]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);

    if (selectedFiles && selectedFiles.length > 0) {
      validate('files', selectedFiles);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (files && !errors.files) {
      console.log('파일 업로드:', files);
      // 파일 업로드 로직...
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
      />
      {errors.files && <span>{errors.files}</span>}

      <button type="submit">업로드</button>
    </form>
  );
};
```

---

## 주요 특징

1. **유연성**: 다양한 검증 규칙을 조합하여 사용 가능
2. **재사용성**: 프로젝트 전체에서 일관된 검증 로직 사용
3. **타입 안전성**: TypeScript 완벽 지원
4. **한국 특화**: 전화번호, 사업자등록번호 등 한국 특화 검증
5. **React 통합**: useValidation Hook으로 React 컴포넌트와 완벽 통합
6. **커스텀 검증**: custom() 함수로 프로젝트 특화 검증 추가 가능

---

## 참고사항

- 모든 검증 함수는 순수 함수로 구현되어 있습니다
- 에러 메시지는 커스터마이징 가능합니다
- 실시간 검증과 제출 시 검증을 모두 지원합니다
- Material-UI, Ant Design 등 모든 UI 라이브러리와 호환됩니다
