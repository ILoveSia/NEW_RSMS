/**
 * 직책 API
 * - common_code_details 테이블에서 직책명 데이터를 조회하는 API
 * - group_code = 'RSBT_RSOF_DVCD' 공통코드 조회
 *
 * @author Claude AI
 * @since 2025-10-20
 */

import type { PositionNameDto } from '../components/molecules/PositionNameComboBox/types';

/**
 * 직책명 콤보박스용 데이터 조회
 * - 백엔드 API 호출: GET /api/common-codes?groupCode=RSBT_RSOF_DVCD
 * - 사용 가능한 항목만 필터링 및 정렬
 *
 * @returns Promise<PositionNameDto[]> 직책명 리스트
 */
export const getPositionNamesForComboBox = async (): Promise<PositionNameDto[]> => {
  try {
    // 실제 백엔드 API 호출
    const response = await fetch('/api/system/codes/groups/RSBT_RSOF_DVCD/details/active', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('직책명 데이터 조회 실패');
    }

    const data: PositionNameDto[] = await response.json();
    return data;
  } catch (error) {
    console.error('직책명 데이터 조회 실패:', error);
    throw new Error('직책명 데이터를 가져오는데 실패했습니다.');
  }
};
