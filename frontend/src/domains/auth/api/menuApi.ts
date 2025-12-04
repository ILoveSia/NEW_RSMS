/**
 * 메뉴 API 클라이언트
 * - LeftMenu용 메뉴 계층 구조 조회
 * - MenuMgmt용 메뉴 CRUD 및 권한 관리 API
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import authApiClient from './authApi';

// =====================
// 타입 정의
// =====================

/**
 * 메뉴 아이템 DTO (백엔드 MenuItemDto 매핑)
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
  isTestPage?: boolean;
  children?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 메뉴 권한 DTO (백엔드 MenuPermissionDto 매핑)
 */
export interface MenuPermissionDto {
  menuPermissionId: number;
  menuId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  roleCategory: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSelect: boolean;
  assignedAt?: string;
  assignedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 메뉴 생성 요청 DTO
 */
export interface CreateMenuRequest {
  menuCode: string;
  menuName: string;
  description?: string;
  url?: string;
  parameters?: string;
  menuType?: string;
  depth?: number;
  parentId?: number;
  sortOrder?: number;
  systemCode?: string;
  icon?: string;
  isActive?: string;
  isTestPage?: string;
  requiresAuth?: string;
  openInNewWindow?: string;
  dashboardLayout?: string;
}

/**
 * 메뉴 수정 요청 DTO
 */
export interface UpdateMenuRequest {
  menuCode?: string;
  menuName?: string;
  description?: string;
  url?: string;
  parameters?: string;
  menuType?: string;
  sortOrder?: number;
  icon?: string;
  isActive?: string;
  isTestPage?: string;
  requiresAuth?: string;
  openInNewWindow?: string;
  dashboardLayout?: string;
}

/**
 * 메뉴 권한 생성 요청 DTO
 */
export interface CreateMenuPermissionRequest {
  menuId: number;
  roleId: number;
  canView?: string;
  canCreate?: string;
  canUpdate?: string;
  canDelete?: string;
  canSelect?: string;
}

/**
 * 메뉴 권한 수정 요청 DTO
 */
export interface UpdateMenuPermissionRequest {
  canView?: string;
  canCreate?: string;
  canUpdate?: string;
  canDelete?: string;
  canSelect?: string;
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

// =====================
// 메뉴 CRUD API (MenuMgmt용)
// =====================

/**
 * 전체 메뉴 목록 조회 (flat list)
 * GET /menus
 */
export const getAllMenusApi = async (): Promise<MenuItem[]> => {
  const response = await authApiClient.get<MenuItem[]>('/menus');
  return response.data;
};

/**
 * 메뉴 단건 조회
 * GET /menus/{menuId}
 */
export const getMenuByIdApi = async (menuId: number): Promise<MenuItem> => {
  const response = await authApiClient.get<MenuItem>(`/menus/${menuId}`);
  return response.data;
};

/**
 * 메뉴 생성
 * POST /menus
 */
export const createMenuApi = async (request: CreateMenuRequest): Promise<MenuItem> => {
  const response = await authApiClient.post<MenuItem>('/menus', request);
  return response.data;
};

/**
 * 메뉴 수정
 * PUT /menus/{menuId}
 */
export const updateMenuApi = async (menuId: number, request: UpdateMenuRequest): Promise<MenuItem> => {
  const response = await authApiClient.put<MenuItem>(`/menus/${menuId}`, request);
  return response.data;
};

/**
 * 메뉴 삭제
 * DELETE /menus/{menuId}
 */
export const deleteMenuApi = async (menuId: number): Promise<void> => {
  await authApiClient.delete(`/menus/${menuId}`);
};

// =====================
// 메뉴 권한 API (MenuMgmt용)
// =====================

/**
 * 메뉴별 권한 목록 조회
 * GET /menus/{menuId}/permissions
 */
export const getMenuPermissionsApi = async (menuId: number): Promise<MenuPermissionDto[]> => {
  const response = await authApiClient.get<MenuPermissionDto[]>(`/menus/${menuId}/permissions`);
  return response.data;
};

/**
 * 메뉴 권한 생성
 * POST /menus/permissions
 */
export const createMenuPermissionApi = async (request: CreateMenuPermissionRequest): Promise<MenuPermissionDto> => {
  const response = await authApiClient.post<MenuPermissionDto>('/menus/permissions', request);
  return response.data;
};

/**
 * 메뉴 권한 수정
 * PUT /menus/permissions/{menuPermissionId}
 */
export const updateMenuPermissionApi = async (
  menuPermissionId: number,
  request: UpdateMenuPermissionRequest
): Promise<MenuPermissionDto> => {
  const response = await authApiClient.put<MenuPermissionDto>(`/menus/permissions/${menuPermissionId}`, request);
  return response.data;
};

/**
 * 메뉴 권한 삭제
 * DELETE /menus/permissions/{menuPermissionId}
 */
export const deleteMenuPermissionApi = async (menuPermissionId: number): Promise<void> => {
  await authApiClient.delete(`/menus/permissions/${menuPermissionId}`);
};

/**
 * 메뉴 권한 복수 삭제
 * DELETE /menus/permissions
 */
export const deleteMenuPermissionsApi = async (menuPermissionIds: number[]): Promise<void> => {
  await authApiClient.delete('/menus/permissions', {
    data: menuPermissionIds
  });
};

// =====================
// 유틸리티 함수
// =====================

/**
 * MenuItem 목록을 트리 구조로 변환
 * - 백엔드에서 flat list로 반환된 데이터를 트리로 구성
 */
export const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  const menuMap = new Map<number, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // 1. 모든 메뉴를 Map에 등록 (children 초기화)
  menus.forEach(menu => {
    menuMap.set(menu.menuId, { ...menu, children: [] });
  });

  // 2. 부모-자식 관계 설정
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.menuId);
    if (!menuItem) return;

    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      }
    } else {
      rootMenus.push(menuItem);
    }
  });

  // 3. sortOrder로 정렬
  const sortChildren = (menus: MenuItem[]): MenuItem[] => {
    menus.sort((a, b) => a.sortOrder - b.sortOrder);
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        sortChildren(menu.children);
      }
    });
    return menus;
  };

  return sortChildren(rootMenus);
};
