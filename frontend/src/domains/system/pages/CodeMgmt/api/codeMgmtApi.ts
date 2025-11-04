/**
 * 코드관리 API 서비스
 *
 * @description 공통코드 관리 REST API 통신 모듈
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author Claude AI
 * @since 2025-09-24
 */

import apiClient from '@/shared/api/apiClient';
import type { CodeGroup, CodeDetail } from '../types/codeMgmt.types';

// ===============================
// 타입 정의
// ===============================

export interface CreateCodeGroupRequest {
  groupCode: string;
  groupName: string;
  description?: string;
  category: string;
  categoryCode: string;
  systemCode: boolean;
  editable: boolean;
  sortOrder: number;
  isActive: string;
}

export interface UpdateCodeGroupRequest {
  groupName: string;
  description?: string;
  category: string;
  sortOrder: number;
  isActive: string;
}

export interface CreateCodeDetailRequest {
  groupCode: string;
  detailCode: string;
  detailName: string;
  description?: string;
  parentCode?: string;
  levelDepth: number;
  sortOrder: number;
  extAttr1?: string;
  extAttr2?: string;
  extAttr3?: string;
  extraData?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: string;
}

export interface UpdateCodeDetailRequest {
  detailName: string;
  description?: string;
  sortOrder: number;
  extAttr1?: string;
  extAttr2?: string;
  extAttr3?: string;
  extraData?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: string;
}

// ===============================
// 코드 그룹 API
// ===============================

/**
 * 모든 코드 그룹 조회
 */
export const getAllCodeGroups = async (): Promise<CodeGroup[]> => {
  const response = await apiClient.get<CodeGroup[]>('/system/codes/groups');
  return response.data;
};

/**
 * 코드 그룹 검색
 */
export const searchCodeGroups = async (
  keyword?: string,
  category?: string,
  isActive?: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: CodeGroup[]; totalElements: number }> => {
  const params: Record<string, string> = {
    page: page.toString(),
    size: size.toString()
  };
  if (keyword) params.keyword = keyword;
  if (category) params.category = category;
  if (isActive) params.isActive = isActive;

  const response = await apiClient.get<{ content: CodeGroup[]; totalElements: number }>(
    '/system/codes/groups/search',
    { params }
  );
  return response.data;
};

/**
 * 코드 그룹 단건 조회
 */
export const getCodeGroup = async (groupCode: string): Promise<CodeGroup> => {
  const response = await apiClient.get<CodeGroup>(`/system/codes/groups/${groupCode}`);
  return response.data;
};

/**
 * 코드 그룹 생성
 */
export const createCodeGroup = async (request: CreateCodeGroupRequest): Promise<CodeGroup> => {
  const response = await apiClient.post<CodeGroup>('/system/codes/groups', request);
  return response.data;
};

/**
 * 코드 그룹 수정
 */
export const updateCodeGroup = async (
  groupCode: string,
  request: UpdateCodeGroupRequest
): Promise<CodeGroup> => {
  const response = await apiClient.put<CodeGroup>(`/system/codes/groups/${groupCode}`, request);
  return response.data;
};

/**
 * 코드 그룹 삭제
 */
export const deleteCodeGroup = async (groupCode: string): Promise<void> => {
  await apiClient.delete(`/system/codes/groups/${groupCode}`);
};

// ===============================
// 코드 상세 API
// ===============================

/**
 * 그룹별 상세 코드 조회
 */
export const getCodeDetailsByGroup = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await apiClient.get<CodeDetail[]>(`/system/codes/groups/${groupCode}/details`);
  return response.data;
};

/**
 * 그룹별 활성화된 상세 코드 조회
 */
export const getActiveCodeDetailsByGroup = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await apiClient.get<CodeDetail[]>(`/system/codes/groups/${groupCode}/details/active`);
  return response.data;
};

/**
 * 현재 유효한 코드 조회
 */
export const getCurrentValidCodes = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await apiClient.get<CodeDetail[]>(`/system/codes/groups/${groupCode}/details/valid`);
  return response.data;
};

/**
 * 상세 코드 단건 조회
 */
export const getCodeDetail = async (
  groupCode: string,
  detailCode: string
): Promise<CodeDetail> => {
  const response = await apiClient.get<CodeDetail>(`/system/codes/groups/${groupCode}/details/${detailCode}`);
  return response.data;
};

/**
 * 상세 코드 생성
 */
export const createCodeDetail = async (request: CreateCodeDetailRequest): Promise<CodeDetail> => {
  const response = await apiClient.post<CodeDetail>('/system/codes/details', request);
  return response.data;
};

/**
 * 상세 코드 수정
 */
export const updateCodeDetail = async (
  groupCode: string,
  detailCode: string,
  request: UpdateCodeDetailRequest
): Promise<CodeDetail> => {
  const response = await apiClient.put<CodeDetail>(
    `/system/codes/groups/${groupCode}/details/${detailCode}`,
    request
  );
  return response.data;
};

/**
 * 상세 코드 삭제
 */
export const deleteCodeDetail = async (groupCode: string, detailCode: string): Promise<void> => {
  await apiClient.delete(`/system/codes/groups/${groupCode}/details/${detailCode}`);
};
