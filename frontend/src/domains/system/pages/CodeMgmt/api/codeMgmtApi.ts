/**
 * 코드관리 API 서비스
 *
 * @description 공통코드 관리 REST API 통신 모듈
 * @author Claude AI
 * @since 2025-09-24
 */

import type { CodeGroup, CodeDetail } from '../types/codeMgmt.types';

const API_BASE_URL = '/api/system/codes';

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
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('코드 그룹 조회에 실패했습니다.');
  }

  return response.json();
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
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (category) params.append('category', category);
  if (isActive) params.append('isActive', isActive);
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await fetch(`${API_BASE_URL}/groups/search?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('코드 그룹 검색에 실패했습니다.');
  }

  return response.json();
};

/**
 * 코드 그룹 단건 조회
 */
export const getCodeGroup = async (groupCode: string): Promise<CodeGroup> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('코드 그룹 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 코드 그룹 생성
 */
export const createCodeGroup = async (request: CreateCodeGroupRequest): Promise<CodeGroup> => {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('코드 그룹 생성에 실패했습니다.');
  }

  return response.json();
};

/**
 * 코드 그룹 수정
 */
export const updateCodeGroup = async (
  groupCode: string,
  request: UpdateCodeGroupRequest
): Promise<CodeGroup> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('코드 그룹 수정에 실패했습니다.');
  }

  return response.json();
};

/**
 * 코드 그룹 삭제
 */
export const deleteCodeGroup = async (groupCode: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('코드 그룹 삭제에 실패했습니다.');
  }
};

// ===============================
// 코드 상세 API
// ===============================

/**
 * 그룹별 상세 코드 조회
 */
export const getCodeDetailsByGroup = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('상세 코드 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 그룹별 활성화된 상세 코드 조회
 */
export const getActiveCodeDetailsByGroup = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details/active`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('활성화된 상세 코드 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 현재 유효한 코드 조회
 */
export const getCurrentValidCodes = async (groupCode: string): Promise<CodeDetail[]> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details/valid`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('유효한 코드 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 상세 코드 단건 조회
 */
export const getCodeDetail = async (
  groupCode: string,
  detailCode: string
): Promise<CodeDetail> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details/${detailCode}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('상세 코드 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 상세 코드 생성
 */
export const createCodeDetail = async (request: CreateCodeDetailRequest): Promise<CodeDetail> => {
  const response = await fetch(`${API_BASE_URL}/details`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('상세 코드 생성에 실패했습니다.');
  }

  return response.json();
};

/**
 * 상세 코드 수정
 */
export const updateCodeDetail = async (
  groupCode: string,
  detailCode: string,
  request: UpdateCodeDetailRequest
): Promise<CodeDetail> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details/${detailCode}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('상세 코드 수정에 실패했습니다.');
  }

  return response.json();
};

/**
 * 상세 코드 삭제
 */
export const deleteCodeDetail = async (groupCode: string, detailCode: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupCode}/details/${detailCode}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('상세 코드 삭제에 실패했습니다.');
  }
};
