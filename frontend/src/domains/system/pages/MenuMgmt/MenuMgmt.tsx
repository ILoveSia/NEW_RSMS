/**
 * 메뉴관리 페이지
 * - 메뉴 트리 구조 관리
 * - 메뉴별 역할 권한 관리
 * - 실제 데이터 연동 (API)
 *
 * @author Claude AI
 * @since 2025-12-04
 */

import toast from '@/shared/utils/toast';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Material-UI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Styles
import styles from './MenuMgmt.module.scss';

// Types (Frontend 내부용)
import type {
  MenuFilters,
  MenuModalState,
  PermissionTableState,
  TreeState
} from './types/menuMgmt.types';

// API
import {
  buildMenuTree,
  createMenuApi,
  createMenuPermissionApi,
  deleteMenuApi,
  deleteMenuPermissionsApi,
  getAllMenusApi,
  getMenuPermissionsApi,
  updateMenuApi,
  updateMenuPermissionApi,
  type CreateMenuRequest,
  type MenuItem,
  type MenuPermissionDto,
  type UpdateMenuRequest
} from '@/domains/auth/api/menuApi';

// Shared Components
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, FormLabel, Grid, InputAdornment, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';

// AG-Grid
import type { ColDef, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';

// Menu specific components
import MenuTreeComponent from './components/MenuTreeComponent';

/**
 * 메뉴 노드 인터페이스 (프론트엔드용 트리 표시)
 * - MenuItem을 트리 구조 표시에 맞게 변환
 * - id는 string으로 변환 (AG-Grid, Tree 컴포넌트용)
 */
interface MenuNodeDisplay {
  id: string;          // menuId를 string으로 변환
  menuId: number;      // 원본 menuId
  menuName: string;
  menuCode: string;
  description?: string;
  url?: string;
  parameters?: string;
  order: number;       // sortOrder
  depth: number;
  parentId?: string;   // parentId를 string으로 변환
  children: MenuNodeDisplay[];
  systemCode: string;
  menuType: 'folder' | 'page';
  isActive: boolean;
  isTestPage?: boolean;
  requiresAuth: boolean;
  openInNewWindow: boolean;
  dashboardLayout: boolean;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 메뉴 권한 표시용 인터페이스 (그리드용)
 */
interface MenuPermissionDisplay {
  id: string;
  menuPermissionId: number;
  menuId: number;
  roleId: number;
  roleName: string;
  roleCode: string;
  roleCategory: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSelect: boolean;
}

interface MenuMgmtProps {
  className?: string;
}

/**
 * MenuItem을 MenuNodeDisplay로 변환
 * - 백엔드 DTO를 프론트엔드 표시용 인터페이스로 변환
 * - id를 string으로 변환 (AG-Grid, Tree 컴포넌트 호환)
 */
const convertToDisplayNode = (menu: MenuItem): MenuNodeDisplay => ({
  id: String(menu.menuId),
  menuId: menu.menuId,
  menuName: menu.menuName,
  menuCode: menu.menuCode,
  description: menu.description,
  url: menu.url,
  parameters: menu.parameters,
  order: menu.sortOrder,
  depth: menu.depth,
  parentId: menu.parentId ? String(menu.parentId) : undefined,
  children: menu.children ? menu.children.map(convertToDisplayNode) : [],
  systemCode: menu.systemCode,
  menuType: menu.menuType,
  isActive: menu.isActive,
  isTestPage: menu.isTestPage,
  requiresAuth: menu.requiresAuth,
  openInNewWindow: menu.openInNewWindow,
  dashboardLayout: menu.dashboardLayout,
  icon: menu.icon,
  createdAt: menu.createdAt,
  updatedAt: menu.updatedAt,
});

/**
 * MenuPermissionDto를 MenuPermissionDisplay로 변환
 */
const convertToPermissionDisplay = (perm: MenuPermissionDto): MenuPermissionDisplay => ({
  id: String(perm.menuPermissionId),
  menuPermissionId: perm.menuPermissionId,
  menuId: perm.menuId,
  roleId: perm.roleId,
  roleName: perm.roleName,
  roleCode: perm.roleCode,
  roleCategory: perm.roleCategory || '사용자',
  canView: perm.canView,
  canCreate: perm.canCreate,
  canUpdate: perm.canUpdate,
  canDelete: perm.canDelete,
  canSelect: perm.canSelect,
});

const MenuMgmt: React.FC<MenuMgmtProps> = ({ className }) => {
  const { t } = useTranslation('system');

  // ==========================================
  // State Management
  // ==========================================

  // 메뉴 트리 데이터 (API에서 로드)
  const [menuTree, setMenuTree] = useState<MenuNodeDisplay[]>([]);
  const [flatMenus, setFlatMenus] = useState<MenuItem[]>([]); // 원본 flat list
  const [permissions, setPermissions] = useState<MenuPermissionDisplay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPermissionLoading, setIsPermissionLoading] = useState<boolean>(false);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isNewMenu, setIsNewMenu] = useState<boolean>(false); // 신규 메뉴 추가 모드
  const [editingMenuData, setEditingMenuData] = useState<Partial<MenuNodeDisplay> | null>(null);

  const [filters, setFilters] = useState<MenuFilters>({
    searchKeyword: '',
    menuType: '',
    isActive: '',
    requiresAuth: ''
  });

  const [modalState, setModalState] = useState<MenuModalState>({
    addModal: false,
    editModal: false,
    detailModal: false,
    selectedMenu: null
  });

  const [treeState, setTreeState] = useState<TreeState>({
    expandedNodes: new Set<string>(),
    selectedNode: null,
    searchResults: [],
    searchTerm: '',
    draggedNode: null,
    dropTarget: null
  });

  const [permissionState, setPermissionState] = useState<PermissionTableState>({
    selectedPermissions: [],
    editingPermission: null,
    bulkEditMode: false,
    conflictWarnings: []
  });

  // 선택된 권한 ID 목록 (그리드 체크박스)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  // ==========================================
  // API 호출: 메뉴 목록 로드
  // ==========================================
  const loadMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const menus = await getAllMenusApi();
      setFlatMenus(menus);

      // 트리 구조로 변환
      const tree = buildMenuTree(menus);
      const displayTree = tree.map(convertToDisplayNode);
      setMenuTree(displayTree);

      // 첫 번째 depth=1 메뉴들 확장
      const expandedIds = new Set<string>(displayTree.map(m => m.id));
      setTreeState(prev => ({
        ...prev,
        expandedNodes: expandedIds
      }));
    } catch (error) {
      console.error('메뉴 목록 조회 실패:', error);
      toast.error('메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================
  // API 호출: 메뉴별 권한 로드
  // ==========================================
  const loadMenuPermissions = useCallback(async (menuId: number) => {
    setIsPermissionLoading(true);
    try {
      const perms = await getMenuPermissionsApi(menuId);
      const displayPerms = perms.map(convertToPermissionDisplay);
      setPermissions(displayPerms);
    } catch (error) {
      console.error('메뉴 권한 조회 실패:', error);
      toast.error('메뉴 권한을 불러오는데 실패했습니다.');
      setPermissions([]);
    } finally {
      setIsPermissionLoading(false);
    }
  }, []);

  // ==========================================
  // 초기 데이터 로드
  // ==========================================
  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // ==========================================
  // 메뉴 선택 시 권한 로드
  // ==========================================
  useEffect(() => {
    if (treeState.selectedNode && !isEditing) {
      const menuId = parseInt(treeState.selectedNode, 10);
      if (!isNaN(menuId)) {
        loadMenuPermissions(menuId);
      }
    }
  }, [treeState.selectedNode, isEditing, loadMenuPermissions]);

  // ==========================================
  // DataGrid 컬럼 정의
  // ==========================================
  const permissionColumns: ColDef<MenuPermissionDisplay>[] = useMemo(() => [
    {
      field: 'select',
      headerName: '',
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      field: 'roleCategory',
      headerName: '역할구분',
      width: 120,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: data.roleCategory === '최고관리자' ? '#e53e3e' :
                              data.roleCategory === '관리자' ? '#3182ce' : '#38a169',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
              {data.roleCategory === '최고관리자' ? '최' :
               data.roleCategory === '관리자' ? '관' : '사'}
            </Typography>
          </Box>
          {data.roleCategory}
        </Box>
      )
    },
    {
      field: 'roleName',
      headerName: '역할명',
      width: 180,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {data.roleName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {data.roleCode}
          </Typography>
        </Box>
      )
    },
    {
      field: 'canView',
      headerName: '조회',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox
            size="small"
            checked={data.canView}
            onChange={async (e) => {
              try {
                await updateMenuPermissionApi(data.menuPermissionId, {
                  canView: e.target.checked ? 'Y' : 'N'
                });
                // 권한 목록 새로고침
                loadMenuPermissions(data.menuId);
              } catch (error) {
                toast.error('권한 수정에 실패했습니다.');
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'canCreate',
      headerName: '입력',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox
            size="small"
            checked={data.canCreate}
            onChange={async (e) => {
              try {
                await updateMenuPermissionApi(data.menuPermissionId, {
                  canCreate: e.target.checked ? 'Y' : 'N'
                });
                loadMenuPermissions(data.menuId);
              } catch (error) {
                toast.error('권한 수정에 실패했습니다.');
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'canUpdate',
      headerName: '수정',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox
            size="small"
            checked={data.canUpdate}
            onChange={async (e) => {
              try {
                await updateMenuPermissionApi(data.menuPermissionId, {
                  canUpdate: e.target.checked ? 'Y' : 'N'
                });
                loadMenuPermissions(data.menuId);
              } catch (error) {
                toast.error('권한 수정에 실패했습니다.');
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'canDelete',
      headerName: '삭제',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermissionDisplay }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox
            size="small"
            checked={data.canDelete}
            onChange={async (e) => {
              try {
                await updateMenuPermissionApi(data.menuPermissionId, {
                  canDelete: e.target.checked ? 'Y' : 'N'
                });
                loadMenuPermissions(data.menuId);
              } catch (error) {
                toast.error('권한 수정에 실패했습니다.');
              }
            }}
          />
        </Box>
      )
    }
  ], [loadMenuPermissions]);

  // ==========================================
  // Event Handlers
  // ==========================================

  /**
   * 메뉴 선택 핸들러
   */
  const handleMenuSelect = useCallback((menuId: string) => {
    // 편집 모드 중이면 선택 변경 불가
    if (isEditing) {
      toast.warning('편집을 완료하거나 취소한 후 다른 메뉴를 선택해주세요.');
      return;
    }

    setTreeState(prev => ({
      ...prev,
      selectedNode: menuId
    }));
  }, [isEditing]);

  /**
   * 메뉴 확장/축소 핸들러
   */
  const handleMenuExpand = useCallback((menuId: string) => {
    setTreeState(prev => {
      const newExpanded = new Set(prev.expandedNodes);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return {
        ...prev,
        expandedNodes: newExpanded
      };
    });
  }, []);

  // ==========================================
  // Computed values
  // ==========================================

  /**
   * 통계 정보
   */
  const statistics = useMemo(() => {
    const totalMenus = flatMenus.length;
    const activeMenus = flatMenus.filter(m => m.isActive).length;
    const uniqueRoles = new Set(permissions.map(p => p.roleId)).size;

    return {
      totalMenus,
      activeMenus,
      inactiveMenus: totalMenus - activeMenus,
      totalRoles: uniqueRoles
    };
  }, [flatMenus, permissions]);

  /**
   * 선택된 메뉴 정보
   */
  const selectedMenuInfo = useMemo((): MenuNodeDisplay | null => {
    if (!treeState.selectedNode) return null;

    const findMenu = (nodes: MenuNodeDisplay[], id: string): MenuNodeDisplay | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children.length > 0) {
          const found = findMenu(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findMenu(menuTree, treeState.selectedNode);
  }, [treeState.selectedNode, menuTree]);

  /**
   * 현재 편집 중인 메뉴 데이터 또는 선택된 메뉴 데이터
   */
  const currentMenuData = useMemo(() => {
    return isEditing ? editingMenuData : selectedMenuInfo;
  }, [isEditing, editingMenuData, selectedMenuInfo]);

  /**
   * 입력 필드 값 변경 핸들러
   */
  const handleFieldChange = useCallback((field: keyof MenuNodeDisplay, value: string | boolean | number) => {
    if (!isEditing) return;

    setEditingMenuData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [isEditing]);

  // ==========================================
  // 메뉴 관리 핸들러들
  // ==========================================

  /**
   * 하위 메뉴 추가
   */
  const handleAddSubMenu = useCallback(() => {
    if (!selectedMenuInfo) {
      toast.warning('상위 메뉴를 먼저 선택해주세요.');
      return;
    }

    // 새 메뉴 객체 생성
    const newMenu: Partial<MenuNodeDisplay> = {
      id: 'new',
      menuId: 0, // 신규
      menuName: '',
      menuCode: '',
      description: '',
      url: '',
      parameters: '',
      order: (selectedMenuInfo.children.length + 1) * 10,
      depth: selectedMenuInfo.depth + 1,
      parentId: selectedMenuInfo.id,
      children: [],
      systemCode: '',
      menuType: 'page',
      isActive: true,
      requiresAuth: true,
      openInNewWindow: false,
      dashboardLayout: false,
      icon: '',
    };

    setIsEditing(true);
    setIsNewMenu(true);
    setEditingMenuData(newMenu);

    toast.info('새 메뉴 정보를 입력하고 저장해주세요.');
  }, [selectedMenuInfo]);

  /**
   * 메뉴 저장 (신규/수정)
   */
  const handleSaveMenu = useCallback(async () => {
    if (!editingMenuData) return;

    // 필수 필드 검증
    if (!editingMenuData.menuName || editingMenuData.menuName.trim() === '') {
      toast.warning('메뉴명을 입력해주세요.');
      return;
    }
    if (!editingMenuData.menuCode || editingMenuData.menuCode.trim() === '') {
      toast.warning('메뉴코드를 입력해주세요.');
      return;
    }

    try {
      if (isNewMenu) {
        // 신규 메뉴 생성
        const request: CreateMenuRequest = {
          menuCode: editingMenuData.menuCode || '',
          menuName: editingMenuData.menuName || '',
          description: editingMenuData.description,
          url: editingMenuData.url,
          parameters: editingMenuData.parameters,
          menuType: editingMenuData.menuType,
          depth: editingMenuData.depth,
          parentId: editingMenuData.parentId ? parseInt(editingMenuData.parentId, 10) : undefined,
          sortOrder: editingMenuData.order,
          systemCode: editingMenuData.systemCode,
          icon: editingMenuData.icon,
          isActive: editingMenuData.isActive ? 'Y' : 'N',
          requiresAuth: editingMenuData.requiresAuth ? 'Y' : 'N',
          openInNewWindow: editingMenuData.openInNewWindow ? 'Y' : 'N',
          dashboardLayout: editingMenuData.dashboardLayout ? 'Y' : 'N',
        };

        await createMenuApi(request);
        toast.success('새 메뉴가 생성되었습니다.');
      } else if (editingMenuData.menuId) {
        // 기존 메뉴 수정
        const request: UpdateMenuRequest = {
          menuCode: editingMenuData.menuCode,
          menuName: editingMenuData.menuName,
          description: editingMenuData.description,
          url: editingMenuData.url,
          parameters: editingMenuData.parameters,
          menuType: editingMenuData.menuType,
          sortOrder: editingMenuData.order,
          icon: editingMenuData.icon,
          isActive: editingMenuData.isActive ? 'Y' : 'N',
          requiresAuth: editingMenuData.requiresAuth ? 'Y' : 'N',
          openInNewWindow: editingMenuData.openInNewWindow ? 'Y' : 'N',
          dashboardLayout: editingMenuData.dashboardLayout ? 'Y' : 'N',
        };

        await updateMenuApi(editingMenuData.menuId, request);
        toast.success('메뉴가 수정되었습니다.');
      }

      // 메뉴 목록 새로고침
      await loadMenus();

      // 편집 모드 해제
      setIsEditing(false);
      setIsNewMenu(false);
      setEditingMenuData(null);
    } catch (error) {
      console.error('메뉴 저장 실패:', error);
      toast.error('메뉴 저장에 실패했습니다.');
    }
  }, [editingMenuData, isNewMenu, loadMenus]);

  /**
   * 편집 취소 핸들러
   */
  const handleCancelEdit = useCallback(() => {
    if (isEditing) {
      const confirmCancel = window.confirm('편집 중인 내용이 있습니다. 정말 취소하시겠습니까?');
      if (confirmCancel) {
        setIsEditing(false);
        setIsNewMenu(false);
        setEditingMenuData(null);
        toast.info('편집이 취소되었습니다.');
      }
    }
  }, [isEditing]);

  /**
   * 메뉴 삭제 핸들러
   */
  const handleDeleteMenu = useCallback(async () => {
    if (!selectedMenuInfo) return;

    if (selectedMenuInfo.children.length > 0) {
      toast.warning('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.');
      return;
    }

    const confirmDelete = window.confirm(
      `"${selectedMenuInfo.menuName}" 메뉴를 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.`
    );

    if (!confirmDelete) return;

    try {
      await deleteMenuApi(selectedMenuInfo.menuId);
      toast.success('메뉴가 삭제되었습니다.');

      // 선택 상태 초기화 및 목록 새로고침
      setTreeState(prev => ({
        ...prev,
        selectedNode: null
      }));
      setPermissions([]);
      await loadMenus();
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      toast.error('메뉴 삭제에 실패했습니다.');
    }
  }, [selectedMenuInfo, loadMenus]);

  /**
   * 편집 모드 진입 (기존 메뉴 수정)
   */
  const handleEditMenu = useCallback(() => {
    if (!selectedMenuInfo) return;
    setIsEditing(true);
    setIsNewMenu(false);
    setEditingMenuData({ ...selectedMenuInfo });
  }, [selectedMenuInfo]);

  /**
   * 권한 선택 변경 핸들러
   */
  const handlePermissionSelectionChanged = useCallback((event: SelectionChangedEvent<MenuPermissionDisplay>) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedPermissionIds(selectedRows.map(r => r.menuPermissionId));
  }, []);

  /**
   * 선택된 권한 삭제
   */
  const handleDeletePermissions = useCallback(async () => {
    if (selectedPermissionIds.length === 0) {
      toast.warning('삭제할 권한을 선택해주세요.');
      return;
    }

    const confirmDelete = window.confirm(
      `선택한 ${selectedPermissionIds.length}개 권한을 삭제하시겠습니까?`
    );

    if (!confirmDelete) return;

    try {
      await deleteMenuPermissionsApi(selectedPermissionIds);
      toast.success('권한이 삭제되었습니다.');

      if (treeState.selectedNode) {
        const menuId = parseInt(treeState.selectedNode, 10);
        if (!isNaN(menuId)) {
          await loadMenuPermissions(menuId);
        }
      }
      setSelectedPermissionIds([]);
    } catch (error) {
      console.error('권한 삭제 실패:', error);
      toast.error('권한 삭제에 실패했습니다.');
    }
  }, [selectedPermissionIds, treeState.selectedNode, loadMenuPermissions]);

  // 검색어 상태 관리
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // 검색 시 자동으로 관련 노드 확장
    if (term) {
      const expandNodes = new Set(treeState.expandedNodes);
      // 모든 1depth, 2depth 노드 확장
      menuTree.forEach(node => {
        expandNodes.add(node.id);
        node.children.forEach(child => {
          expandNodes.add(child.id);
        });
      });
      setTreeState(prev => ({ ...prev, expandedNodes: expandNodes }));
    }
  }, [treeState.expandedNodes, menuTree]);

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* PageHeader - PositionMgmt 표준 패턴 준수 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <MenuIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>메뉴관리</h1>
              <p className={styles.pageDescription}>
                시스템 메뉴 구조 및 사용자별 메뉴 접근 권한을 관리합니다
              </p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AccountTreeIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalMenus}</div>
                <div className={styles.statLabel}>전체 메뉴</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeMenus}</div>
                <div className={styles.statLabel}>활성 메뉴</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalRoles}</div>
                <div className={styles.statLabel}>권한 역할</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* 좌측 패널 - 메뉴 트리 */}
            <Grid item xs={12} md={4}>
              <Paper className={styles.leftPanel}>
                <div className={styles.leftHeader}>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    sx={{
                      fontSize: '0.875rem !important',
                      fontWeight: '500 !important',
                      lineHeight: '1.2 !important',
                      margin: '0 !important',
                      fontFamily: 'inherit !important'
                    }}
                  >
                    메뉴 정보
                  </Typography>
                </div>

                <div className={styles.searchSection}>
                  <TextField
                    size="small"
                    placeholder="메뉴명을 입력하세요"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--theme-background-default) !important',
                      }
                    }}
                  />
                </div>

                <div className={styles.treeContainer}>
                  <MenuTreeComponent
                    menuTree={menuTree}
                    treeState={treeState}
                    onMenuSelect={handleMenuSelect}
                    onMenuExpand={handleMenuExpand}
                    searchTerm={searchTerm}
                  />
                </div>
              </Paper>
            </Grid>

            {/* 우측 패널 - 메뉴 정보 및 권한 관리 */}
            <Grid item xs={12} md={8}>
              <div className={styles.rightPanel}>
                {/* 상단: 메뉴 정보 폼 */}
                <Paper className={styles.menuForm} sx={{ mb: 2, height: '45%' }}>
                  <div className={styles.formHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography
                        variant="subtitle1"
                        component="h3"
                        sx={{
                          fontSize: '0.875rem !important',
                          fontWeight: '500 !important',
                          lineHeight: '1.2 !important',
                          margin: '0 !important',
                          fontFamily: 'inherit !important'
                        }}
                      >
                        메뉴 정보
                      </Typography>
                      {isEditing && (
                        <Box sx={{
                          backgroundColor: 'var(--theme-warning-light)',
                          color: 'var(--theme-warning-main)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {isNewMenu ? '신규 등록' : '편집 모드'}
                        </Box>
                      )}
                    </div>
                    <div className={styles.formActions}>
                      {isEditing ? (
                        // 편집 모드일 때 버튼들
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleSaveMenu}
                            title="변경사항을 저장합니다"
                            sx={{
                              mr: 0.5,
                              background: 'var(--theme-button-primary)',
                              color: 'var(--theme-button-primary-text)',
                              border: 'none',
                              '&:hover': {
                                background: 'var(--theme-button-primary-hover)',
                              }
                            }}
                          >
                            저장
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCancelEdit}
                            title="편집을 취소합니다"
                            sx={{
                              mr: 0.5,
                              borderColor: 'var(--theme-error-main) !important',
                              color: 'var(--theme-error-main) !important',
                              background: 'transparent !important',
                              border: '1px solid var(--theme-error-main) !important',
                              '&:hover': {
                                backgroundColor: 'var(--theme-error-light) !important',
                                borderColor: 'var(--theme-error-dark) !important',
                                color: 'var(--theme-error-dark) !important',
                              }
                            }}
                          >
                            취소
                          </Button>
                        </>
                      ) : (
                        // 일반 모드일 때 버튼들
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddSubMenu}
                            disabled={!selectedMenuInfo}
                            title={selectedMenuInfo ? `"${selectedMenuInfo.menuName}" 하위에 새 메뉴를 추가합니다` : '메뉴를 선택해주세요'}
                            sx={{
                              mr: 0.5,
                              background: 'var(--theme-button-secondary)',
                              color: 'var(--theme-button-secondary-text)',
                              border: 'none',
                              '&:hover:not(:disabled)': {
                                background: 'var(--theme-button-secondary-hover)',
                              }
                            }}
                          >
                            추가
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleEditMenu}
                            disabled={!selectedMenuInfo}
                            title={selectedMenuInfo ? '메뉴 정보를 수정합니다' : '메뉴를 선택해주세요'}
                            sx={{
                              mr: 0.5,
                              background: 'var(--theme-button-primary)',
                              color: 'var(--theme-button-primary-text)',
                              border: 'none',
                              '&:hover:not(:disabled)': {
                                background: 'var(--theme-button-primary-hover)',
                              }
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDeleteMenu}
                            disabled={!selectedMenuInfo || (selectedMenuInfo?.children.length ?? 0) > 0}
                            title={
                              !selectedMenuInfo
                                ? '메뉴를 선택해주세요'
                                : (selectedMenuInfo.children.length > 0)
                                ? '하위 메뉴가 있는 메뉴는 삭제할 수 없습니다'
                                : `"${selectedMenuInfo.menuName}" 메뉴를 삭제합니다`
                            }
                            sx={{
                              mr: 0.5,
                              borderColor: 'var(--theme-error-main) !important',
                              color: 'var(--theme-error-main) !important',
                              background: 'transparent !important',
                              border: '1px solid var(--theme-error-main) !important',
                              '&:hover:not(:disabled)': {
                                backgroundColor: 'var(--theme-error-light) !important',
                                borderColor: 'var(--theme-error-dark) !important',
                                color: 'var(--theme-error-dark) !important',
                              },
                              '&:disabled': {
                                borderColor: 'rgba(0, 0, 0, 0.26) !important',
                                color: 'rgba(0, 0, 0, 0.26) !important',
                              }
                            }}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.formContent}>
                    {currentMenuData ? (
                      <Grid container spacing={2}>
                        {/* 첫 번째 행: 메뉴명, 메뉴코드 */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="메뉴명 *"
                            value={currentMenuData.menuName || ''}
                            onChange={(e) => handleFieldChange('menuName', e.target.value)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="메뉴코드 *"
                            value={currentMenuData.menuCode || ''}
                            onChange={(e) => handleFieldChange('menuCode', e.target.value)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>

                        {/* 두 번째 행: 메뉴 설명 (전체 너비) */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="메뉴 설명"
                            value={currentMenuData.description || ''}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>

                        {/* 세 번째 행: 메뉴 URL, 대시보드 레이아웃 */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="메뉴 URL"
                            value={currentMenuData.url || ''}
                            onChange={(e) => handleFieldChange('url', e.target.value)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%'
                          }}>
                            <FormLabel sx={{
                              fontSize: '0.875rem',
                              color: 'var(--theme-text-primary) !important',
                              fontWeight: 500,
                              minWidth: 'auto',
                              whiteSpace: 'nowrap'
                            }}>
                              대시보드 레이아웃 :
                            </FormLabel>
                            <RadioGroup
                              row
                              value={currentMenuData.dashboardLayout ? 'true' : 'false'}
                              onChange={(e) => handleFieldChange('dashboardLayout', e.target.value === 'true')}
                              sx={{
                                gap: 2,
                                '& .MuiFormControlLabel-label': {
                                  color: 'var(--theme-text-primary) !important',
                                  fontWeight: 500,
                                  fontSize: '0.875rem'
                                },
                                '& .MuiFormControlLabel-root': {
                                  pointerEvents: isEditing ? 'auto' : 'none',
                                  opacity: isEditing ? 1 : 0.6
                                }
                              }}
                            >
                              <FormControlLabel
                                value="true"
                                control={<Radio size="small" />}
                                label="여"
                              />
                              <FormControlLabel
                                value="false"
                                control={<Radio size="small" />}
                                label="부"
                              />
                            </RadioGroup>
                          </div>
                        </Grid>

                        {/* 네 번째 행: 메뉴 파라미터 (전체 너비) */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="메뉴 파라미터"
                            value={currentMenuData.parameters || ''}
                            onChange={(e) => handleFieldChange('parameters', e.target.value)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>

                        {/* 다섯 번째 행: 순서, 사용여부 */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="순서"
                            type="number"
                            value={currentMenuData.order || 0}
                            onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
                            disabled={!isEditing}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--theme-background-default) !important',
                              },
                              '& .MuiInputLabel-root': {
                                color: 'var(--theme-text-primary) !important',
                                fontWeight: 500,
                              },
                              '& .MuiOutlinedInput-input': {
                                color: 'var(--theme-text-primary) !important',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%'
                          }}>
                            <FormLabel sx={{
                              fontSize: '0.875rem',
                              color: 'var(--theme-text-primary) !important',
                              fontWeight: 500,
                              minWidth: 'auto',
                              whiteSpace: 'nowrap'
                            }}>
                              사용여부 :
                            </FormLabel>
                            <RadioGroup
                              row
                              value={currentMenuData.isActive ? 'true' : 'false'}
                              onChange={(e) => handleFieldChange('isActive', e.target.value === 'true')}
                              sx={{
                                gap: 2,
                                '& .MuiFormControlLabel-label': {
                                  color: 'var(--theme-text-primary) !important',
                                  fontWeight: 500,
                                  fontSize: '0.875rem'
                                },
                                '& .MuiFormControlLabel-root': {
                                  pointerEvents: isEditing ? 'auto' : 'none',
                                  opacity: isEditing ? 1 : 0.6
                                }
                              }}
                            >
                              <FormControlLabel
                                value="false"
                                control={<Radio size="small" />}
                                label="미사용"
                              />
                              <FormControlLabel
                                value="true"
                                control={<Radio size="small" />}
                                label="사용"
                              />
                            </RadioGroup>
                          </div>
                        </Grid>
                      </Grid>
                    ) : (
                      <div className={styles.noSelection}>
                        <Typography variant="body1" color="textSecondary">
                          좌측 메뉴 트리에서 메뉴를 선택하세요.
                        </Typography>
                      </div>
                    )}
                  </div>
                </Paper>

                {/* 하단: 권한 관리 테이블 */}
                <Paper className={styles.permissionTable} sx={{ height: '45%' }}>
                  <div className={styles.tableHeader}>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        fontSize: '0.875rem !important',
                        fontWeight: '500 !important',
                        lineHeight: '1.2 !important',
                        margin: '0 !important',
                        fontFamily: 'inherit !important'
                      }}
                    >
                      역할 권한 설정
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDeletePermissions}
                        disabled={selectedPermissionIds.length === 0}
                        sx={{
                          mr: 0.5,
                          borderColor: 'var(--theme-error-main) !important',
                          color: 'var(--theme-error-main) !important',
                          background: 'transparent !important',
                          border: '1px solid var(--theme-error-main) !important',
                          '&:hover:not(:disabled)': {
                            backgroundColor: 'var(--theme-error-light) !important',
                            borderColor: 'var(--theme-error-dark) !important',
                            color: 'var(--theme-error-dark) !important',
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </Box>
                  </div>

                  <div className={styles.tableContent}>
                    {isPermissionLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={30} />
                      </Box>
                    ) : permissions.length > 0 ? (
                      <div style={{ height: '100%', width: '100%' }}>
                        <AgGridReact<MenuPermissionDisplay>
                          rowData={permissions}
                          columnDefs={permissionColumns}
                          defaultColDef={{
                            sortable: true,
                            filter: false,
                            resizable: true,
                            suppressMovable: true
                          }}
                          rowSelection="multiple"
                          suppressRowClickSelection={true}
                          headerHeight={40}
                          rowHeight={48}
                          animateRows={true}
                          className="ag-theme-alpine"
                          onGridReady={(params: GridReadyEvent) => {
                            params.api.sizeColumnsToFit();
                          }}
                          onFirstDataRendered={(params) => {
                            params.api.sizeColumnsToFit();
                          }}
                          onSelectionChanged={handlePermissionSelectionChanged}
                          suppressCellFocus={true}
                          enableCellTextSelection={true}
                          getRowId={(params) => params.data.id}
                          overlayNoRowsTemplate="<span>선택된 메뉴의 권한 정보가 없습니다.</span>"
                        />
                      </div>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '200px',
                          color: 'text.secondary'
                        }}
                      >
                        <Typography variant="body1">
                          {treeState.selectedNode
                            ? '선택된 메뉴의 권한 정보가 없습니다.'
                            : '메뉴를 선택해주세요.'}
                        </Typography>
                      </Box>
                    )}
                  </div>
                </Paper>
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  );
};

export default MenuMgmt;
