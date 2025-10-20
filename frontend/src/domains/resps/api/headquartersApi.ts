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
 * - 백엔드 API 호출: GET /api/common-codes?groupCode=DPRM_CD
 * - 사용 가능한 항목만 필터링 및 정렬
 *
 * @returns Promise<HeadquartersDto[]> 본부명 리스트
 */
export const getHeadquartersForComboBox = async (): Promise<HeadquartersDto[]> => {
  try {
    // 실제 백엔드 API 호출
    const response = await fetch('/api/system/codes/groups/DPRM_CD/details/active', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('본부명 데이터 조회 실패');
    }

    const data: HeadquartersDto[] = await response.json();
    return data;
  } catch (error) {
    console.error('본부명 데이터 조회 실패:', error);
    throw new Error('본부명 데이터를 가져오는데 실패했습니다.');
  }
};
