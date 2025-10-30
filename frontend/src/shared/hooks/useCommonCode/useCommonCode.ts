/**
 * 공통코드 조회 및 변환 Hook
 *
 * @description
 * - rsms-code-store에서 공통코드를 조회하고 UI 컴포넌트에서 사용하기 쉽게 변환
 * - 콤보박스, 셀렉트박스, 라디오버튼 등에서 재사용 가능
 *
 * @example
 * // 기본 사용 (SelectBox용)
 * const { options } = useCommonCode('CFRN_CYCL_DVCD');
 * <Select>
 *   {options.map(opt => <MenuItem value={opt.value}>{opt.label}</MenuItem>)}
 * </Select>
 *
 * @example
 * // 전체 옵션 포함
 * const { optionsWithAll } = useCommonCode('CFRN_CYCL_DVCD', '전체');
 *
 * @example
 * // 코드 → 이름 변환
 * const { getCodeName } = useCommonCode('CFRN_CYCL_DVCD');
 * const displayName = getCodeName('MONTH'); // "월"
 *
 * @example
 * // 원본 코드 목록
 * const { codes } = useCommonCode('CFRN_CYCL_DVCD');
 *
 * @author Claude AI
 * @since 2025-10-29
 */

import { useMemo } from 'react';
import { useCodeStore, type CommonCodeDetail } from '@/app/store/codeStore';

/**
 * 옵션 타입 (SelectBox, ComboBox, RadioButton 등에서 사용)
 */
export interface CodeOption {
  /** 코드값 (detailCode) */
  value: string;
  /** 표시명 (detailName) */
  label: string;
  /** 원본 코드 객체 (필요시 사용) */
  code?: CommonCodeDetail;
}

/**
 * useCommonCode 반환 타입
 */
export interface UseCommonCodeReturn {
  /** 원본 공통코드 목록 */
  codes: CommonCodeDetail[];
  /** SelectBox/ComboBox용 옵션 목록 */
  options: CodeOption[];
  /** "전체" 옵션이 포함된 옵션 목록 */
  optionsWithAll: CodeOption[];
  /** 코드값 → 이름 변환 함수 */
  getCodeName: (detailCode: string) => string;
  /** 이름 → 코드값 변환 함수 */
  getCodeValue: (detailName: string) => string;
  /** 특정 코드 존재 여부 확인 */
  hasCode: (detailCode: string) => boolean;
}

/**
 * 공통코드 조회 및 변환 Hook
 *
 * @param groupCode 공통코드 그룹코드 (예: 'CFRN_CYCL_DVCD')
 * @param allLabel "전체" 옵션 라벨 (기본값: '전체')
 * @returns 공통코드 관련 데이터 및 유틸 함수
 */
export const useCommonCode = (
  groupCode: string,
  allLabel: string = '전체'
): UseCommonCodeReturn => {
  // rsms-code-store에서 공통코드 조회
  const getCodeDetails = useCodeStore((state) => state.getCodeDetails);
  const codes = useMemo(() => getCodeDetails(groupCode), [getCodeDetails, groupCode]);

  // SelectBox/ComboBox용 옵션 목록
  const options = useMemo<CodeOption[]>(() => {
    return codes.map(code => ({
      value: code.detailCode,
      label: code.detailName,
      code
    }));
  }, [codes]);

  // "전체" 옵션이 포함된 옵션 목록
  const optionsWithAll = useMemo<CodeOption[]>(() => {
    return [
      { value: '', label: allLabel },
      ...options
    ];
  }, [options, allLabel]);

  // 코드값 → 이름 변환
  const getCodeName = useMemo(() => {
    return (detailCode: string): string => {
      const code = codes.find(c => c.detailCode === detailCode);
      return code ? code.detailName : detailCode;
    };
  }, [codes]);

  // 이름 → 코드값 변환
  const getCodeValue = useMemo(() => {
    return (detailName: string): string => {
      const code = codes.find(c => c.detailName === detailName);
      return code ? code.detailCode : detailName;
    };
  }, [codes]);

  // 특정 코드 존재 여부 확인
  const hasCode = useMemo(() => {
    return (detailCode: string): boolean => {
      return codes.some(c => c.detailCode === detailCode);
    };
  }, [codes]);

  return {
    codes,
    options,
    optionsWithAll,
    getCodeName,
    getCodeValue,
    hasCode
  };
};

/**
 * 여러 그룹코드를 한번에 조회하는 Hook
 *
 * @example
 * const codes = useCommonCodes({
 *   holdingPeriod: 'CFRN_CYCL_DVCD',
 *   committeeType: 'CMITE_DVCD',
 *   isActive: 'USE_YN'
 * });
 *
 * // 사용
 * codes.holdingPeriod.options
 * codes.committeeType.getCodeName('CHAIR')
 */
export const useCommonCodes = <T extends Record<string, string>>(
  groupCodes: T
): Record<keyof T, UseCommonCodeReturn> => {
  const getCodeDetails = useCodeStore((state) => state.getCodeDetails);

  return useMemo(() => {
    const result: any = {};

    Object.entries(groupCodes).forEach(([key, groupCode]) => {
      const codes = getCodeDetails(groupCode);

      const options = codes.map(code => ({
        value: code.detailCode,
        label: code.detailName,
        code
      }));

      const optionsWithAll = [
        { value: '', label: '전체' },
        ...options
      ];

      const getCodeName = (detailCode: string): string => {
        const code = codes.find(c => c.detailCode === detailCode);
        return code ? code.detailName : detailCode;
      };

      const getCodeValue = (detailName: string): string => {
        const code = codes.find(c => c.detailName === detailName);
        return code ? code.detailCode : detailName;
      };

      const hasCode = (detailCode: string): boolean => {
        return codes.some(c => c.detailCode === detailCode);
      };

      result[key] = {
        codes,
        options,
        optionsWithAll,
        getCodeName,
        getCodeValue,
        hasCode
      };
    });

    return result;
  }, [getCodeDetails, groupCodes]);
};
