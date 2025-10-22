/**
 * 본부명 API
 * - common_code_details 테이블에서 본부명 데이터를 조회하는 API
 * - group_code = 'DPRM_CD' 공통코드 조회
 *
 * @author Claude AI
 * @since 2025-10-20
 */

import type { HeadquartersDto } from '../components/molecules/HeadquartersComboBox/types';

/**
 * 본부명 콤보박스용 데이터 조회
 * - 백엔드 API 호출: GET /api/system/codes/groups/DPRM_CD/details/active
 * - common_code_details 테이블에서 group_code = 'DPRM_CD' 조회
 * - 사용 가능한(isActive='Y') 항목만 반환, sortOrder로 정렬
 *
 * @returns Promise<HeadquartersDto[]> 본부명 리스트
 * @throws Error 네트워크 에러 또는 서버 에러 발생 시
 */
export const getHeadquartersForComboBox = async (): Promise<HeadquartersDto[]> => {
  try {
    // 백엔드 API 호출 (CommonCodeController.getActiveCodeDetailsByGroup)
    const response = await fetch('/api/system/codes/groups/DPRM_CD/details/active', {
      method: 'GET',
      credentials: 'include', // 세션 인증을 위한 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // HTTP 에러 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error('본부명 API 에러:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (response.status === 403) {
        throw new Error('본부명 조회 권한이 없습니다.');
      } else if (response.status === 404) {
        throw new Error('본부명 데이터를 찾을 수 없습니다.');
      } else {
        throw new Error(`본부명 조회 실패 (${response.status})`);
      }
    }

    // JSON 파싱 및 반환
    const data: HeadquartersDto[] = await response.json();

    // 데이터 유효성 검증
    if (!Array.isArray(data)) {
      console.error('본부명 API 응답이 배열이 아닙니다:', data);
      throw new Error('본부명 데이터 형식이 올바르지 않습니다.');
    }

    console.log('본부명 데이터 조회 성공:', data.length, '건');
    return data;

  } catch (error) {
    // 에러 로깅 및 재throw
    if (error instanceof Error) {
      console.error('본부명 조회 실패:', error.message);
      throw error;
    } else {
      console.error('본부명 조회 중 알 수 없는 에러:', error);
      throw new Error('본부명 데이터를 가져오는데 실패했습니다.');
    }
  }
};
