/**
 * Validation 유틸리티
 *
 * @description 입력 필드 검증을 위한 공통 유틸리티 함수
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-01-13
 */

import type {
  ValidationResult,
  ValidationOptions,
  DateValidationOptions,
  FileValidationOptions,
  PasswordValidationOptions,
  FormValidationResult,
  FieldValidationRules
} from './validation.types';

// ========================================
// 기본 Validation 규칙
// ========================================

/**
 * 필수 입력 검증
 */
export const required = (message: string = '필수 입력 항목입니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, message };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, message };
    }

    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 최소 길이 검증
 */
export const minLength = (min: number, message?: string): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const defaultMessage = `최소 ${min}자 이상 입력해주세요`;
    const str = String(value || '');

    if (str.length < min) {
      return { isValid: false, message: message || defaultMessage };
    }

    return { isValid: true };
  };
};

/**
 * 최대 길이 검증
 */
export const maxLength = (max: number, message?: string): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const defaultMessage = `최대 ${max}자까지 입력 가능합니다`;
    const str = String(value || '');

    if (str.length > max) {
      return { isValid: false, message: message || defaultMessage };
    }

    return { isValid: true };
  };
};

/**
 * 최소값 검증
 */
export const min = (minValue: number, message?: string): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const defaultMessage = `최소값은 ${minValue}입니다`;
    const num = Number(value);

    if (isNaN(num) || num < minValue) {
      return { isValid: false, message: message || defaultMessage };
    }

    return { isValid: true };
  };
};

/**
 * 최대값 검증
 */
export const max = (maxValue: number, message?: string): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const defaultMessage = `최대값은 ${maxValue}입니다`;
    const num = Number(value);

    if (isNaN(num) || num > maxValue) {
      return { isValid: false, message: message || defaultMessage };
    }

    return { isValid: true };
  };
};

/**
 * 패턴 검증 (정규식)
 */
export const pattern = (regex: RegExp, message: string = '올바른 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const str = String(value || '');

    if (!regex.test(str)) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 이메일 검증
 */
export const email = (message: string = '올바른 이메일 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailRegex, message);
};

/**
 * 숫자만 검증
 */
export const numeric = (message: string = '숫자만 입력 가능합니다'): ((value: any) => ValidationResult) => {
  const numericRegex = /^\d+$/;
  return pattern(numericRegex, message);
};

/**
 * 영문자만 검증
 */
export const alpha = (message: string = '영문자만 입력 가능합니다'): ((value: any) => ValidationResult) => {
  const alphaRegex = /^[a-zA-Z]+$/;
  return pattern(alphaRegex, message);
};

/**
 * 영문자+숫자 검증
 */
export const alphanumeric = (message: string = '영문자와 숫자만 입력 가능합니다'): ((value: any) => ValidationResult) => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return pattern(alphanumericRegex, message);
};

// ========================================
// 복합 Validation 규칙
// ========================================

/**
 * 전화번호 검증 (한국)
 * 예: 010-1234-5678, 02-1234-5678, 031-123-4567
 */
export const phoneNumber = (message: string = '올바른 전화번호 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const phoneRegex = /^(0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4]))-?(\d{3,4})-?(\d{4})$|^01([0|1|6|7|8|9])-?(\d{3,4})-?(\d{4})$/;
    const str = String(value || '').replace(/\s/g, '');

    if (!phoneRegex.test(str)) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 휴대폰 번호 검증
 * 예: 010-1234-5678
 */
export const mobileNumber = (message: string = '올바른 휴대폰 번호 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const mobileRegex = /^01([0|1|6|7|8|9])-?(\d{3,4})-?(\d{4})$/;
    const str = String(value || '').replace(/\s/g, '');

    if (!mobileRegex.test(str)) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 사업자등록번호 검증
 * 예: 123-45-67890
 */
export const businessNumber = (message: string = '올바른 사업자등록번호 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const str = String(value || '').replace(/[-\s]/g, '');

    // 형식 검증
    if (!/^\d{10}$/.test(str)) {
      return { isValid: false, message };
    }

    // 체크섬 검증
    const checksum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(str[i]) * checksum[i];
    }

    sum += Math.floor((parseInt(str[8]) * 5) / 10);
    const lastDigit = (10 - (sum % 10)) % 10;

    if (lastDigit !== parseInt(str[9])) {
      return { isValid: false, message: '유효하지 않은 사업자등록번호입니다' };
    }

    return { isValid: true };
  };
};

/**
 * 주민등록번호 검증 (앞 6자리만)
 * 예: 901231
 */
export const birthDate = (message: string = '올바른 생년월일 형식이 아닙니다 (YYMMDD)'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const str = String(value || '').replace(/[-\s]/g, '');

    if (!/^\d{6}$/.test(str)) {
      return { isValid: false, message };
    }

    const year = parseInt(str.substring(0, 2));
    const month = parseInt(str.substring(2, 4));
    const day = parseInt(str.substring(4, 6));

    if (month < 1 || month > 12) {
      return { isValid: false, message: '올바른 월을 입력해주세요 (01-12)' };
    }

    if (day < 1 || day > 31) {
      return { isValid: false, message: '올바른 일을 입력해주세요 (01-31)' };
    }

    return { isValid: true };
  };
};

/**
 * 날짜 검증
 */
export const date = (options?: DateValidationOptions): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const dateValue = value instanceof Date ? value : new Date(value);

    if (isNaN(dateValue.getTime())) {
      return { isValid: false, message: options?.message || '올바른 날짜 형식이 아닙니다' };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 미래 날짜 검증
    if (options?.allowFuture === false && dateValue > now) {
      return { isValid: false, message: options?.message || '미래 날짜는 선택할 수 없습니다' };
    }

    // 과거 날짜 검증
    if (options?.allowPast === false && dateValue < now) {
      return { isValid: false, message: options?.message || '과거 날짜는 선택할 수 없습니다' };
    }

    // 최소 날짜 검증
    if (options?.minDate) {
      const minDate = options.minDate instanceof Date ? options.minDate : new Date(options.minDate);
      if (dateValue < minDate) {
        return { isValid: false, message: options?.message || `${minDate.toLocaleDateString()} 이후 날짜를 선택해주세요` };
      }
    }

    // 최대 날짜 검증
    if (options?.maxDate) {
      const maxDate = options.maxDate instanceof Date ? options.maxDate : new Date(options.maxDate);
      if (dateValue > maxDate) {
        return { isValid: false, message: options?.message || `${maxDate.toLocaleDateString()} 이전 날짜를 선택해주세요` };
      }
    }

    return { isValid: true };
  };
};

/**
 * 날짜 범위 검증
 */
export const dateRange = (startDate: Date | string, endDate: Date | string, message?: string): ValidationResult => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: message || '올바른 날짜 형식이 아닙니다' };
  }

  if (start > end) {
    return { isValid: false, message: message || '시작일은 종료일보다 이전이어야 합니다' };
  }

  return { isValid: true };
};

/**
 * URL 검증
 */
export const url = (message: string = '올바른 URL 형식이 아닙니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const str = String(value || '');

    if (!urlRegex.test(str)) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 비밀번호 강도 검증
 */
export const password = (options?: PasswordValidationOptions): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    const str = String(value || '');
    const minLen = options?.minLength || 8;

    // 길이 검증
    if (str.length < minLen) {
      return { isValid: false, message: options?.message || `비밀번호는 최소 ${minLen}자 이상이어야 합니다` };
    }

    // 대문자 검증
    if (options?.requireUppercase && !/[A-Z]/.test(str)) {
      return { isValid: false, message: options?.message || '비밀번호에 대문자가 포함되어야 합니다' };
    }

    // 소문자 검증
    if (options?.requireLowercase && !/[a-z]/.test(str)) {
      return { isValid: false, message: options?.message || '비밀번호에 소문자가 포함되어야 합니다' };
    }

    // 숫자 검증
    if (options?.requireNumber && !/\d/.test(str)) {
      return { isValid: false, message: options?.message || '비밀번호에 숫자가 포함되어야 합니다' };
    }

    // 특수문자 검증
    if (options?.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(str)) {
      return { isValid: false, message: options?.message || '비밀번호에 특수문자가 포함되어야 합니다' };
    }

    return { isValid: true };
  };
};

/**
 * 비밀번호 확인 검증
 */
export const passwordConfirm = (originalPassword: string, message: string = '비밀번호가 일치하지 않습니다'): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    if (value !== originalPassword) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

/**
 * 파일 검증
 */
export const file = (options?: FileValidationOptions): ((value: File | File[]) => ValidationResult) => {
  return (value: File | File[]): ValidationResult => {
    const files = Array.isArray(value) ? value : [value];

    // 파일 개수 검증
    if (options?.maxFiles && files.length > options.maxFiles) {
      return {
        isValid: false,
        message: options?.message || `최대 ${options.maxFiles}개 파일까지 업로드 가능합니다`
      };
    }

    for (const file of files) {
      // 파일 크기 검증
      if (options?.maxSize && file.size > options.maxSize) {
        const maxSizeMB = (options.maxSize / 1024 / 1024).toFixed(2);
        return {
          isValid: false,
          message: options?.message || `파일 크기는 최대 ${maxSizeMB}MB까지 가능합니다`
        };
      }

      // 파일 타입 검증
      if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          message: options?.message || `허용되지 않는 파일 형식입니다`
        };
      }
    }

    return { isValid: true };
  };
};

// ========================================
// Form Validation
// ========================================

/**
 * 여러 필드 동시 검증
 */
export const validateFields = (
  data: Record<string, any>,
  rules: FieldValidationRules
): FormValidationResult => {
  const errors: Record<string, string> = {};
  let firstErrorField: string | undefined;

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = data[fieldName];

    for (const rule of fieldRules) {
      const result = rule(value);

      if (!result.isValid) {
        errors[fieldName] = result.message || '입력값이 올바르지 않습니다';
        if (!firstErrorField) {
          firstErrorField = fieldName;
        }
        break; // 첫 번째 오류만 표시
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField
  };
};

/**
 * 단일 필드 검증
 */
export const validateField = (
  value: any,
  rules: Array<(value: any) => ValidationResult>
): ValidationResult => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};

/**
 * 커스텀 검증 함수 생성
 */
export const custom = (
  validationFn: (value: any) => boolean,
  message: string = '입력값이 올바르지 않습니다'
): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    if (!validationFn(value)) {
      return { isValid: false, message };
    }

    return { isValid: true };
  };
};

// ========================================
// Export
// ========================================

export const validators = {
  required,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  email,
  numeric,
  alpha,
  alphanumeric,
  phoneNumber,
  mobileNumber,
  businessNumber,
  birthDate,
  date,
  dateRange,
  url,
  password,
  passwordConfirm,
  file,
  custom,
  validateField,
  validateFields
};

export default validators;
