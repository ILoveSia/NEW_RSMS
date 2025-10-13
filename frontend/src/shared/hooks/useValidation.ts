/**
 * useValidation Hook
 *
 * @description Form 검증을 위한 커스텀 Hook
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-01-13
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  ValidationResult,
  FormValidationResult,
  FieldValidationRules
} from '@/shared/utils/validation.types';
import { validateField, validateFields } from '@/shared/utils/validation';

/**
 * useValidation Hook 반환 타입
 */
interface UseValidationReturn {
  /** 필드별 에러 메시지 */
  errors: Record<string, string>;
  /** 필드별 터치 여부 */
  touched: Record<string, boolean>;
  /** 전체 폼이 유효한지 여부 */
  isValid: boolean;
  /** 필드 검증 */
  validate: (fieldName: string, value: any) => ValidationResult;
  /** 전체 폼 검증 */
  validateForm: (data: Record<string, any>) => FormValidationResult;
  /** 필드 터치 설정 */
  setFieldTouched: (fieldName: string, touched?: boolean) => void;
  /** 필드 에러 설정 */
  setFieldError: (fieldName: string, error: string) => void;
  /** 에러 초기화 */
  clearErrors: () => void;
  /** 특정 필드 에러 초기화 */
  clearFieldError: (fieldName: string) => void;
  /** 모든 필드를 터치 상태로 설정 */
  touchAll: () => void;
  /** 초기화 */
  reset: () => void;
}

/**
 * Form 검증 Hook
 *
 * @param rules - 필드별 검증 규칙
 * @returns 검증 관련 상태 및 함수
 *
 * @example
 * ```tsx
 * const { errors, validate, validateForm, setFieldTouched } = useValidation({
 *   email: [validators.required(), validators.email()],
 *   password: [validators.required(), validators.minLength(8)]
 * });
 * ```
 */
export const useValidation = (rules: FieldValidationRules): UseValidationReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * 전체 폼이 유효한지 여부
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * 단일 필드 검증
   */
  const validate = useCallback(
    (fieldName: string, value: any): ValidationResult => {
      const fieldRules = rules[fieldName];

      if (!fieldRules) {
        return { isValid: true };
      }

      const result = validateField(value, fieldRules);

      // 에러 상태 업데이트
      setErrors(prev => {
        const newErrors = { ...prev };

        if (!result.isValid && result.message) {
          newErrors[fieldName] = result.message;
        } else {
          delete newErrors[fieldName];
        }

        return newErrors;
      });

      return result;
    },
    [rules]
  );

  /**
   * 전체 폼 검증
   */
  const validateForm = useCallback(
    (data: Record<string, any>): FormValidationResult => {
      const result = validateFields(data, rules);

      setErrors(result.errors);

      // 모든 필드를 터치 상태로 설정
      const allTouched = Object.keys(rules).reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: true }),
        {}
      );
      setTouched(allTouched);

      return result;
    },
    [rules]
  );

  /**
   * 필드 터치 설정
   */
  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  /**
   * 필드 에러 직접 설정
   */
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  /**
   * 모든 에러 초기화
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * 특정 필드 에러 초기화
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * 모든 필드를 터치 상태로 설정
   */
  const touchAll = useCallback(() => {
    const allTouched = Object.keys(rules).reduce(
      (acc, fieldName) => ({ ...acc, [fieldName]: true }),
      {}
    );
    setTouched(allTouched);
  }, [rules]);

  /**
   * 전체 초기화
   */
  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    isValid,
    validate,
    validateForm,
    setFieldTouched,
    setFieldError,
    clearErrors,
    clearFieldError,
    touchAll,
    reset
  };
};

export default useValidation;
