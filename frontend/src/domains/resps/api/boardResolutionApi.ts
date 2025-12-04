/**
 * 이사회결의 API
 * - board_resolutions 테이블 CRUD
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 * - BoardHistoryMgmt 페이지 백엔드 연동
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 첨부파일 DTO
 */
export interface AttachmentDto {
  attachmentId: string;
  fileName: string;
  storedFileName: string;
  fileSize: number;
  contentType: string;
  fileCategory: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
}

/**
 * 이사회결의 응답 DTO
 */
export interface BoardResolutionDto {
  resolutionId: string;
  ledgerOrderId: string;
  ledgerOrderTitle?: string;
  meetingNumber: number;
  resolutionName: string;
  summary?: string;
  content?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  fileCount?: number;
  responsibilityFileCount?: number;
  attachments?: AttachmentDto[];
}

/**
 * 이사회결의 생성 요청 DTO
 */
export interface CreateBoardResolutionRequest {
  ledgerOrderId: string;
  resolutionName: string;
  summary?: string;
  content?: string;
}

/**
 * 이사회결의 수정 요청 DTO
 */
export interface UpdateBoardResolutionRequest {
  resolutionName?: string;
  summary?: string;
  content?: string;
}

/**
 * 복수 삭제 응답 DTO
 */
export interface DeleteResult {
  successCount: number;
  failCount: number;
  totalRequested: number;
}

/**
 * 통계 응답 DTO
 */
export interface BoardResolutionStatistics {
  totalCount: number;
  currentYearCount: number;
  totalFileCount: number;
}

// ===============================
// API 함수
// ===============================

/**
 * 전체 이사회결의 목록 조회
 * - GET /api/resps/board-resolutions
 */
export const getAllBoardResolutions = async (): Promise<BoardResolutionDto[]> => {
  try {
    const response = await apiClient.get<BoardResolutionDto[]>('/resps/board-resolutions');
    return response.data;
  } catch (error) {
    console.error('이사회결의 목록 조회 실패:', error);
    throw new Error('이사회결의 목록을 가져오는데 실패했습니다.');
  }
};

/**
 * 이사회결의 검색
 * - GET /api/resps/board-resolutions/search
 * - 원장차수ID 또는 결의명으로 검색
 */
export const searchBoardResolutions = async (
  ledgerOrderId?: string,
  keyword?: string
): Promise<BoardResolutionDto[]> => {
  try {
    const params: Record<string, string> = {};
    if (ledgerOrderId) params.ledgerOrderId = ledgerOrderId;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<BoardResolutionDto[]>('/resps/board-resolutions/search', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('이사회결의 검색 실패:', error);
    throw new Error('이사회결의 검색에 실패했습니다.');
  }
};

/**
 * 이사회결의 단건 조회 (상세)
 * - GET /api/resps/board-resolutions/{resolutionId}
 * - 첨부파일 목록 포함
 */
export const getBoardResolution = async (resolutionId: string): Promise<BoardResolutionDto> => {
  try {
    const response = await apiClient.get<BoardResolutionDto>(`/resps/board-resolutions/${resolutionId}`);
    return response.data;
  } catch (error) {
    console.error('이사회결의 상세 조회 실패:', error);
    throw new Error('이사회결의 상세 정보를 가져오는데 실패했습니다.');
  }
};

/**
 * 통계 정보 조회
 * - GET /api/resps/board-resolutions/statistics
 */
export const getBoardResolutionStatistics = async (): Promise<BoardResolutionStatistics> => {
  try {
    const response = await apiClient.get<BoardResolutionStatistics>('/resps/board-resolutions/statistics');
    return response.data;
  } catch (error) {
    console.error('이사회결의 통계 조회 실패:', error);
    throw new Error('통계 정보를 가져오는데 실패했습니다.');
  }
};

/**
 * 이사회결의 생성
 * - POST /api/resps/board-resolutions
 */
export const createBoardResolution = async (
  request: CreateBoardResolutionRequest
): Promise<BoardResolutionDto> => {
  try {
    const response = await apiClient.post<BoardResolutionDto>('/resps/board-resolutions', request);
    return response.data;
  } catch (error) {
    console.error('이사회결의 생성 실패:', error);
    throw new Error('이사회결의 등록에 실패했습니다.');
  }
};

/**
 * 이사회결의 수정
 * - PUT /api/resps/board-resolutions/{resolutionId}
 */
export const updateBoardResolution = async (
  resolutionId: string,
  request: UpdateBoardResolutionRequest
): Promise<BoardResolutionDto> => {
  try {
    const response = await apiClient.put<BoardResolutionDto>(
      `/resps/board-resolutions/${resolutionId}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('이사회결의 수정 실패:', error);
    throw new Error('이사회결의 수정에 실패했습니다.');
  }
};

/**
 * 이사회결의 삭제
 * - DELETE /api/resps/board-resolutions/{resolutionId}
 */
export const deleteBoardResolution = async (resolutionId: string): Promise<void> => {
  try {
    await apiClient.delete(`/resps/board-resolutions/${resolutionId}`);
  } catch (error) {
    console.error('이사회결의 삭제 실패:', error);
    throw new Error('이사회결의 삭제에 실패했습니다.');
  }
};

/**
 * 이사회결의 복수 삭제
 * - DELETE /api/resps/board-resolutions
 */
export const deleteBoardResolutions = async (resolutionIds: string[]): Promise<DeleteResult> => {
  try {
    const response = await apiClient.delete<DeleteResult>('/resps/board-resolutions', {
      data: resolutionIds
    });
    return response.data;
  } catch (error) {
    console.error('이사회결의 복수 삭제 실패:', error);
    throw new Error('이사회결의 삭제에 실패했습니다.');
  }
};
