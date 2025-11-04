/**
 * 메뉴 API 클라이언트
 * - LeftMenu용 메뉴 계층 구조 조회
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import authApiClient from './authApi';

// =====================
// 타입 정의
// =====================

/**
 * 메뉴 아이템
 */
export interface MenuItem {
  menuId: number;
  menuCode: string;
  menuName: string;
  description?: string;
  url?: string;
  parameters?: string;
  menuType: 'folder' | 'page';
  depth: number;
  parentId?: number;
  sortOrder: number;
  systemCode: string;
  icon?: string;
  isActive: boolean;
  requiresAuth: boolean;
  openInNewWindow: boolean;
  dashboardLayout: boolean;
  children?: MenuItem[];
}

/**
 * 메뉴 계층 구조 응답
 */
export interface MenuHierarchyResponse {
  success: boolean;
  menus: MenuItem[];
  totalCount: number;
}

/**
 * 단일 메뉴 응답
 */
export interface MenuResponse {
  success: boolean;
  message?: string;
  menu?: MenuItem;
}

/**
 * 메뉴 목록 응답
 */
export interface MenuListResponse {
  success: boolean;
  menus: MenuItem[];
  totalCount: number;
}

// =====================
// API 함수들
// =====================

/**
 * 메뉴 계층 구조 조회 (LeftMenu용)
 * GET /menus/hierarchy
 */
export const getMenuHierarchyApi = async (): Promise<MenuHierarchyResponse> => {
  const response = await authApiClient.get<MenuHierarchyResponse>('/menus/hierarchy');
  return response.data;
};

/**
 * 최상위 메뉴 목록 조회
 * GET /menus/top
 */
export const getTopLevelMenusApi = async (): Promise<MenuListResponse> => {
  const response = await authApiClient.get<MenuListResponse>('/menus/top');
  return response.data;
};

/**
 * 특정 메뉴의 하위 메뉴 조회
 * GET /menus/{parentId}/children
 */
export const getChildMenusApi = async (parentId: number): Promise<MenuListResponse> => {
  const response = await authApiClient.get<MenuListResponse>(`/menus/${parentId}/children`);
  return response.data;
};

/**
 * 메뉴 코드로 단일 메뉴 조회
 * GET /menus/code/{menuCode}
 */
export const getMenuByCodeApi = async (menuCode: string): Promise<MenuResponse> => {
  const response = await authApiClient.get<MenuResponse>(`/menus/code/${menuCode}`);
  return response.data;
};

/**
 * URL로 메뉴 조회
 * GET /menus/url?url={url}
 */
export const getMenuByUrlApi = async (url: string): Promise<MenuResponse> => {
  const response = await authApiClient.get<MenuResponse>('/menus/url', {
    params: { url }
  });
  return response.data;
};

/**
 * 메뉴명으로 검색
 * GET /menus/search?menuName={menuName}
 */
export const searchMenusApi = async (menuName: string): Promise<MenuListResponse> => {
  const response = await authApiClient.get<MenuListResponse>('/menus/search', {
    params: { menuName }
  });
  return response.data;
};

/**
 * 헬스 체크
 * GET /menus/health
 */
export const menuHealthCheckApi = async (): Promise<{ status: string; service: string }> => {
  const response = await authApiClient.get('/menus/health');
  return response.data;
};
