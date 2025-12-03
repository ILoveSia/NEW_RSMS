/**
 * 임원이행점검보고서 API 클라이언트
 * - 집계현황, 책무별/관리의무별/관리활동별 점검현황 조회
 *
 * @author Claude AI
 * @since 2025-12-03
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 집계 현황 DTO
 */
export interface SummaryStats {
  /** 총 책무 수 */
  totalResponsibilities: number;
  /** 총 관리의무 수 */
  totalObligations: number;
  /** 총 관리활동 수 */
  totalActivities: number;
  /** 이행점검결과 - 적정 건수 */
  appropriateCount: number;
  /** 이행점검결과 - 부적정 건수 */
  inappropriateCount: number;
  /** 개선조치 - 완료 건수 */
  improvementCompletedCount: number;
  /** 개선조치 - 진행중 건수 */
  improvementInProgressCount: number;
}

/**
 * 책무별 점검 현황 DTO
 */
export interface ResponsibilityInspection {
  /** 책무코드 */
  responsibilityCd: string;
  /** 책무명 */
  responsibilityInfo: string;
  /** 점검결과 (적정/부적정/점검) */
  inspectionResult: string;
  /** 총 관리의무 수 */
  totalObligations: number;
  /** 총 관리활동 수 */
  totalActivities: number;
  /** 적정 건수 */
  appropriateCount: number;
  /** 부적정 건수 */
  inappropriateCount: number;
}

/**
 * 관리의무별 점검 현황 DTO
 */
export interface ObligationInspection {
  /** 관리의무코드 */
  obligationCd: string;
  /** 관리의무내용 */
  obligationInfo: string;
  /** 책무코드 */
  responsibilityCd: string;
  /** 책무명 */
  responsibilityInfo: string;
  /** 점검결과 (적정/부적정/점검) */
  inspectionResult: string;
  /** 총 관리활동 수 */
  totalActivities: number;
  /** 적정 건수 */
  appropriateCount: number;
  /** 부적정 건수 */
  inappropriateCount: number;
}

/**
 * 관리활동별 점검 현황 DTO
 */
export interface ActivityInspection {
  /** 이행점검항목ID */
  implInspectionItemId: string;
  /** 부서장업무메뉴얼CD */
  manualCd: string;
  /** 관리활동명 */
  activityName: string;
  /** 책무관리항목 */
  respItem: string;
  /** 관리의무코드 */
  obligationCd: string;
  /** 관리의무내용 */
  obligationInfo: string;
  /** 책무코드 */
  responsibilityCd: string;
  /** 책무명 */
  responsibilityInfo: string;
  /** 점검결과상태코드 (01:미점검, 02:적정, 03:부적정) */
  inspectionStatusCd: string;
  /** 점검결과명 */
  inspectionStatusName: string;
  /** 개선이행상태코드 */
  improvementStatusCd: string;
  /** 개선이행상태명 */
  improvementStatusName: string;
  /** 부서코드 */
  orgCode: string;
  /** 부서명 */
  orgName: string;
}

/**
 * 임원이행점검보고서 전체 응답 DTO
 */
export interface ExecutiveReportResponse {
  /** 집계 현황 */
  summary: SummaryStats;
  /** 책무별 점검 현황 */
  responsibilityInspections: ResponsibilityInspection[];
  /** 관리의무별 점검 현황 */
  obligationInspections: ObligationInspection[];
  /** 관리활동별 점검 현황 */
  activityInspections: ActivityInspection[];
}

/**
 * 임원이행점검보고서 조회 요청 파라미터
 */
export interface ExecutiveReportRequest {
  /** 원장차수ID (필수) */
  ledgerOrderId: string;
  /** 이행점검계획ID (선택) */
  implInspectionPlanId?: string;
  /** 부서코드 (선택) */
  orgCode?: string;
}

// ===============================
// API 함수
// ===============================

/**
 * 임원이행점검보고서 데이터 조회
 * GET /api/reports/executive
 *
 * @param params 조회 파라미터
 * @returns 임원이행점검보고서 응답 DTO
 */
export const getExecutiveReport = async (
  params: ExecutiveReportRequest
): Promise<ExecutiveReportResponse> => {
  try {
    // 빈 값 제거
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<ExecutiveReportResponse>(
      '/reports/executive',
      { params: cleanedParams }
    );
    return response.data;
  } catch (error) {
    console.error('임원이행점검보고서 조회 실패:', error);
    throw new Error('임원이행점검보고서 조회에 실패했습니다.');
  }
};
