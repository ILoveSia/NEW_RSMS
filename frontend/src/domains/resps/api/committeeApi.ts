/**
 * 회의체 API 클라이언트
 *
 * @description 회의체 관리 REST API 호출 함수 모음
 * @author Claude AI
 * @since 2025-10-24
 */

import axios from 'axios';

const API_BASE_URL = '/api/committees';

/**
 * 회의체 DTO 인터페이스
 */
export interface CommitteeDto {
  committeesId?: number;
  ledgerOrderId: string;
  committeesTitle: string;
  committeeFrequency: string;
  resolutionMatters?: string;
  isActive: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  members: CommitteeMemberDto[];
}

/**
 * 회의체 위원 DTO 인터페이스
 */
export interface CommitteeMemberDto {
  committeeDetailsId?: number;
  committeesId?: number;
  committeesType: string; // 'chairman' | 'member'
  positionsId: number;
  positionsName: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

/**
 * 회의체 등록 요청 인터페이스
 */
export interface CommitteeCreateRequest {
  ledgerOrderId: string;
  committeesTitle: string;
  committeeFrequency: string;
  resolutionMatters?: string;
  isActive: string;
  members: {
    committeesType: string;
    positionsId: number;
    positionsName: string;
  }[];
}

/**
 * 회의체 수정 요청 인터페이스
 */
export interface CommitteeUpdateRequest {
  committeesTitle: string;
  committeeFrequency: string;
  resolutionMatters?: string;
  isActive: string;
  members: {
    committeesType: string;
    positionsId: number;
    positionsName: string;
  }[];
}

/**
 * 회의체 통계 인터페이스
 */
export interface CommitteeStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

/**
 * 모든 회의체 조회
 *
 * @returns 전체 회의체 리스트 (위원 목록 포함)
 */
export const getAllCommittees = async (): Promise<CommitteeDto[]> => {
  const response = await axios.get<CommitteeDto[]>(API_BASE_URL);
  return response.data;
};

/**
 * 원장차수별 회의체 조회
 *
 * @param ledgerOrderId 원장차수ID
 * @returns 해당 원장차수의 회의체 리스트
 */
export const getCommitteesByLedgerOrderId = async (
  ledgerOrderId: string
): Promise<CommitteeDto[]> => {
  const response = await axios.get<CommitteeDto[]>(
    `${API_BASE_URL}/ledger/${ledgerOrderId}`
  );
  return response.data;
};

/**
 * 회의체 단건 조회 (위원 목록 포함)
 *
 * @param committeeId 회의체ID
 * @returns 회의체 상세 정보
 */
export const getCommitteeById = async (
  committeeId: number
): Promise<CommitteeDto> => {
  const response = await axios.get<CommitteeDto>(
    `${API_BASE_URL}/${committeeId}`
  );
  return response.data;
};

/**
 * 회의체 등록
 *
 * @param request 회의체 등록 요청 데이터
 * @returns 등록된 회의체 정보
 */
export const createCommittee = async (
  request: CommitteeCreateRequest
): Promise<CommitteeDto> => {
  const response = await axios.post<CommitteeDto>(API_BASE_URL, request);
  return response.data;
};

/**
 * 회의체 수정
 *
 * @param committeeId 회의체ID
 * @param request 회의체 수정 요청 데이터
 * @returns 수정된 회의체 정보
 */
export const updateCommittee = async (
  committeeId: number,
  request: CommitteeUpdateRequest
): Promise<CommitteeDto> => {
  const response = await axios.put<CommitteeDto>(
    `${API_BASE_URL}/${committeeId}`,
    request
  );
  return response.data;
};

/**
 * 회의체 삭제
 *
 * @param committeeId 회의체ID
 */
export const deleteCommittee = async (committeeId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${committeeId}`);
};

/**
 * 회의체 일괄 삭제
 *
 * @param committeeIds 삭제할 회의체ID 목록
 */
export const deleteCommittees = async (
  committeeIds: number[]
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/delete-batch`, { committeeIds });
};

/**
 * 회의체 통계 조회
 *
 * @returns 회의체 통계 정보
 */
export const getCommitteeStats = async (): Promise<CommitteeStats> => {
  const response = await axios.get<CommitteeStats>(`${API_BASE_URL}/stats`);
  return response.data;
};
