import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from '@/shared/utils/toast';

// Material-UI Icons
import MenuIcon from '@mui/icons-material/Menu';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Styles
import styles from './MenuMgmt.module.scss';

// Types
import type {
  MenuNode,
  MenuPermission,
  MenuFilters,
  MenuModalState,
  TreeState,
  PermissionTableState
} from './types/menuMgmt.types';

import {
  MOCK_MENU_TREE,
  MOCK_PERMISSIONS,
  MENU_TYPE_OPTIONS,
  USE_YN_OPTIONS,
  AUTH_REQUIRED_OPTIONS
} from './types/menuMgmt.types';

// Shared Components
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { Grid, Paper, Typography, Box } from '@mui/material';

interface MenuMgmtProps {
  className?: string;
}

const MenuMgmt: React.FC<MenuMgmtProps> = ({ className }) => {
  const { t } = useTranslation('system');

  // State Management
  const [menuTree, setMenuTree] = useState<MenuNode[]>(MOCK_MENU_TREE);
  const [permissions, setPermissions] = useState<MenuPermission[]>(MOCK_PERMISSIONS);
  const [loading, setLoading] = useState<boolean>(false);

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
    expandedNodes: new Set(['2', '21', '3', '31']), // 기본 확장된 노드들
    selectedNode: '312', // 기본 선택된 노드 (메뉴관리)
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

  // Event Handlers
  const handleMenuSelect = useCallback((menuId: string) => {
    setTreeState(prev => ({
      ...prev,
      selectedNode: menuId
    }));

    // 선택된 메뉴의 권한 정보 업데이트
    const menuPermissions = permissions.filter(p => p.menuId === menuId);
    console.log('선택된 메뉴의 권한:', menuPermissions);
  }, [permissions]);

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

  const handleAddMenu = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedMenu: null
    }));
    toast.info('새 메뉴를 등록해주세요.');
  }, []);

  const handleEditMenu = useCallback(() => {
    if (!treeState.selectedNode) {
      toast.warning('수정할 메뉴를 선택해주세요.');
      return;
    }

    // 선택된 메뉴 찾기
    const findMenu = (nodes: MenuNode[], id: string): MenuNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children.length > 0) {
          const found = findMenu(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedMenu = findMenu(menuTree, treeState.selectedNode);
    if (selectedMenu) {
      setModalState(prev => ({
        ...prev,
        editModal: true,
        selectedMenu
      }));
      toast.info('메뉴 정보를 수정해주세요.');
    }
  }, [treeState.selectedNode, menuTree]);

  const handleDeleteMenu = useCallback(() => {
    if (!treeState.selectedNode) {
      toast.warning('삭제할 메뉴를 선택해주세요.');
      return;
    }

    if (!window.confirm('선택된 메뉴를 삭제하시겠습니까?\n하위 메뉴도 함께 삭제됩니다.')) {
      return;
    }

    // TODO: API 호출로 메뉴 삭제
    toast.success('메뉴가 삭제되었습니다.');
  }, [treeState.selectedNode]);

  const handlePermissionSave = useCallback(() => {
    if (permissionState.selectedPermissions.length === 0) {
      toast.warning('저장할 권한을 선택해주세요.');
      return;
    }

    // TODO: API 호출로 권한 저장
    toast.success(`${permissionState.selectedPermissions.length}개 권한이 저장되었습니다.`);
  }, [permissionState.selectedPermissions]);

  // Computed values
  const statistics = useMemo(() => {
    const totalMenus = menuTree.reduce((count, node) => {
      const countNode = (n: MenuNode): number => {
        return 1 + n.children.reduce((sum, child) => sum + countNode(child), 0);
      };
      return count + countNode(node);
    }, 0);

    const activeMenus = menuTree.reduce((count, node) => {
      const countActiveNode = (n: MenuNode): number => {
        const activeCount = n.isActive ? 1 : 0;
        return activeCount + n.children.reduce((sum, child) => sum + countActiveNode(child), 0);
      };
      return count + countActiveNode(node);
    }, 0);

    const totalRoles = permissions.reduce((roles, perm) => {
      roles.add(perm.roleId);
      return roles;
    }, new Set()).size;

    return {
      totalMenus,
      activeMenus,
      inactiveMenus: totalMenus - activeMenus,
      totalRoles
    };
  }, [menuTree, permissions]);

  // 선택된 메뉴 정보
  const selectedMenuInfo = useMemo(() => {
    if (!treeState.selectedNode) return null;

    const findMenu = (nodes: MenuNode[], id: string): MenuNode | null => {
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

  // 선택된 메뉴의 권한 정보
  const selectedMenuPermissions = useMemo(() => {
    if (!treeState.selectedNode) return [];
    return permissions.filter(p => p.menuId === treeState.selectedNode);
  }, [treeState.selectedNode, permissions]);

  // Action buttons
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'add',
      type: 'add',
      onClick: handleAddMenu
    },
    {
      key: 'edit',
      type: 'edit',
      onClick: handleEditMenu,
      disabled: !treeState.selectedNode
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteMenu,
      disabled: !treeState.selectedNode,
      confirmationRequired: true
    }
  ], [handleAddMenu, handleEditMenu, handleDeleteMenu, treeState.selectedNode]);

  // Status info
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성 메뉴',
      value: statistics.activeMenus,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '비활성 메뉴',
      value: statistics.inactiveMenus,
      color: 'default',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 메뉴 트리 렌더링 함수
  const renderMenuTree = useCallback((nodes: MenuNode[], depth = 0) => {
    return nodes.map(node => (
      <div
        key={node.id}
        className={`${styles.treeNode} ${treeState.selectedNode === node.id ? styles.selected : ''}`}
        style={{ paddingLeft: `${depth * 20 + 10}px` }}
        onClick={() => handleMenuSelect(node.id)}
      >
        {node.children.length > 0 && (
          <span
            className={`${styles.expandIcon} ${treeState.expandedNodes.has(node.id) ? styles.expanded : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuExpand(node.id);
            }}
          >
            ▶
          </span>
        )}
        <span className={styles.menuIcon}>
          {node.menuType === 'folder' ? '📁' : '📄'}
        </span>
        <span className={styles.menuName}>{node.menuName}</span>
        {!node.isActive && <span className={styles.inactiveLabel}>비활성</span>}
      </div>
    ));
  }, [treeState, handleMenuSelect, handleMenuExpand]);

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
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* 좌측 패널 - 메뉴 트리 */}
          <Grid item xs={12} md={4}>
            <Paper className={styles.leftPanel}>
              <div className={styles.leftHeader}>
                <Typography variant="h6" component="h2">
                  메뉴 구조
                </Typography>
                <BaseActionBar
                  totalCount={statistics.totalMenus}
                  totalLabel="전체 메뉴"
                  statusInfo={statusInfo}
                  actions={actionButtons}
                  loading={loading}
                  compact={true}
                />
              </div>

              <div className={styles.searchSection}>
                {/* TODO: 메뉴 검색 컴포넌트 추가 */}
                <Typography variant="body2" color="textSecondary">
                  메뉴 검색 기능 (개발 예정)
                </Typography>
              </div>

              <div className={styles.treeContainer}>
                {renderMenuTree(menuTree)}
              </div>
            </Paper>
          </Grid>

          {/* 우측 패널 - 메뉴 정보 및 권한 관리 */}
          <Grid item xs={12} md={8}>
            <div className={styles.rightPanel}>
              {/* 상단: 메뉴 정보 폼 */}
              <Paper className={styles.menuForm} sx={{ mb: 2, height: '45%' }}>
                <div className={styles.formHeader}>
                  <Typography variant="h6" component="h3">
                    메뉴 정보
                  </Typography>
                </div>

                <div className={styles.formContent}>
                  {selectedMenuInfo ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">메뉴명</Typography>
                          <Typography variant="body1">{selectedMenuInfo.menuName}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">시스템코드</Typography>
                          <Typography variant="body1">{selectedMenuInfo.systemCode}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">URL</Typography>
                          <Typography variant="body1">{selectedMenuInfo.url || '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">메뉴 타입</Typography>
                          <Typography variant="body1">
                            {selectedMenuInfo.menuType === 'folder' ? '폴더' :
                             selectedMenuInfo.menuType === 'page' ? '페이지' : '링크'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">사용여부</Typography>
                          <Typography
                            variant="body1"
                            color={selectedMenuInfo.isActive ? 'success.main' : 'error.main'}
                          >
                            {selectedMenuInfo.isActive ? '사용' : '미사용'}
                          </Typography>
                        </Box>
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
                  <Typography variant="h6" component="h3">
                    역할별 권한 설정
                  </Typography>
                  <Box>
                    <button
                      className={styles.actionButton}
                      onClick={handlePermissionSave}
                      disabled={permissionState.selectedPermissions.length === 0}
                    >
                      권한 저장
                    </button>
                  </Box>
                </div>

                <div className={styles.tableContent}>
                  {selectedMenuPermissions.length > 0 ? (
                    <div className={styles.permissionGrid}>
                      <div className={styles.gridHeader}>
                        <span>역할</span>
                        <span>조회</span>
                        <span>입력</span>
                        <span>수정</span>
                        <span>삭제</span>
                        <span>부여</span>
                      </div>
                      {selectedMenuPermissions.map(permission => (
                        <div key={permission.id} className={styles.gridRow}>
                          <span className={styles.roleName}>{permission.roleName}</span>
                          <span className={`${styles.checkbox} ${permission.view ? styles.checked : ''}`}>
                            {permission.view ? '✓' : '✗'}
                          </span>
                          <span className={`${styles.checkbox} ${permission.create ? styles.checked : ''}`}>
                            {permission.create ? '✓' : '✗'}
                          </span>
                          <span className={`${styles.checkbox} ${permission.update ? styles.checked : ''}`}>
                            {permission.update ? '✓' : '✗'}
                          </span>
                          <span className={`${styles.checkbox} ${permission.delete ? styles.checked : ''}`}>
                            {permission.delete ? '✓' : '✗'}
                          </span>
                          <span className={`${styles.checkbox} ${permission.granted ? styles.checked : ''}`}>
                            {permission.granted ? '✓' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noPermissions}>
                      <Typography variant="body1" color="textSecondary">
                        선택된 메뉴의 권한 정보가 없습니다.
                      </Typography>
                    </div>
                  )}
                </div>
              </Paper>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MenuMgmt;