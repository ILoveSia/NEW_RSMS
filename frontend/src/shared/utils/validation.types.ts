/**
 * Validation 유틸리티 타입 정의
 *
 * @description 입력 필드 검증을 위한 타입 및 인터페이스 정의
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-01-13
 */

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  field?: string;
}

/**
 * 검증 규칙 타입
 */
export type ValidationRule = (value: any) => ValidationResult;

/**
 * 필드 검증 규칙 맵
 */
export interface FieldValidationRules {
  [fieldName: string]: ValidationRule[];
}

/**
 * 폼 검증 결과
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: {
    [fieldName: string]: string;
  };
  firstErrorField?: string;
}

/**
 * 검증 옵션
 */
export interface ValidationOptions {
  /** 필수 여부 */
  required?: boolean;
  /** 최소 길이 */
  minLength?: number;
  /** 최대 길이 */
  maxLength?: number;
  /** 최소값 */
  min?: number;
  /** 최대값 */
  max?: number;
  /** 정규식 패턴 */
  pattern?: RegExp;
  /** 커스텀 에러 메시지 */
  message?: string;
  /** 커스텀 검증 함수 */
  custom?: (value: any) => boolean;
}

/**
 * 날짜 검증 옵션
 */
export interface DateValidationOptions {
  /** 최소 날짜 */
  minDate?: Date | string;
  /** 최대 날짜 */
  maxDate?: Date | string;
  /** 미래 날짜 허용 여부 */
  allowFuture?: boolean;
  /** 과거 날짜 허용 여부 */
  allowPast?: boolean;
  /** 커스텀 에러 메시지 */
  message?: string;
}

/**
 * 파일 검증 옵션
 */
export interface FileValidationOptions {
  /** 최대 파일 크기 (바이트) */
  maxSize?: number;
  /** 허용 파일 타입 */
  allowedTypes?: string[];
  /** 최대 파일 개수 */
  maxFiles?: number;
  /** 커스텀 에러 메시지 */
  message?: string;
}

/**
 * 비밀번호 검증 옵션
 */
export interface PasswordValidationOptions {
  /** 최소 길이 */
  minLength?: number;
  /** 대문자 필수 여부 */
  requireUppercase?: boolean;
  /** 소문자 필수 여부 */
  requireLowercase?: boolean;
  /** 숫자 필수 여부 */
  requireNumber?: boolean;
  /** 특수문자 필수 여부 */
  requireSpecialChar?: boolean;
  /** 커스텀 에러 메시지 */
  message?: string;
}
