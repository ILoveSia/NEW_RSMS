import toast from '@/shared/utils/toast';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Material-UI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Styles
import styles from './MenuMgmt.module.scss';

// Types
import type {
  MenuFilters,
  MenuModalState,
  MenuNode,
  MenuPermission,
  PermissionTableState,
  TreeState
} from './types/menuMgmt.types';

import {
  MOCK_MENU_TREE,
  MOCK_PERMISSIONS
} from './types/menuMgmt.types';

// Shared Components
import { Box, Button, Checkbox, FormControlLabel, FormLabel, Grid, InputAdornment, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';

// AG-Grid
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';

// Menu specific components
import MenuTreeComponent from './components/MenuTreeComponent';

interface MenuMgmtProps {
  className?: string;
}

const MenuMgmt: React.FC<MenuMgmtProps> = ({ className }) => {
  const { t } = useTranslation('system');

  // State Management
  const [menuTree, setMenuTree] = useState<MenuNode[]>(MOCK_MENU_TREE);
  const [permissions, setPermissions] = useState<MenuPermission[]>(MOCK_PERMISSIONS);
  const [isEditing, setIsEditing] = useState<boolean>(false); // 편집 모드 상태
  const [editingMenuData, setEditingMenuData] = useState<Partial<MenuNode> | null>(null); // 편집 중인 메뉴 데이터

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
    expandedNodes: new Set(['01', '02', '08']), // 기본 확장된 노드들 (대시보드, 책무구조도, 시스템관리)
    selectedNode: '0802', // 기본 선택된 노드 (메뉴관리)
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

  // DataGrid 컬럼 정의
  const permissionColumns: ColDef<MenuPermission>[] = useMemo(() => [
    {
      field: 'select',
      headerName: '',
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      field: 'roleCategory',
      headerName: '실명',
      width: 120,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
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
      headerName: '역할명(MenuId)',
      width: 180,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
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
      field: 'extendedPermissionType',
      headerName: '상세권한',
      width: 120,
      valueGetter: ({ data }) => data?.extendedPermissionType || '-'
    },
    {
      field: 'extendedPermissionName',
      headerName: '상세권한명',
      width: 140,
      valueGetter: ({ data }) => data?.extendedPermissionName || '-'
    },
    {
      field: 'view',
      headerName: '조회',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox size="small" checked={data.view} />
        </Box>
      )
    },
    {
      field: 'create',
      headerName: '입력',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox size="small" checked={data.create} />
        </Box>
      )
    },
    {
      field: 'update',
      headerName: '수정',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox size="small" checked={data.update} />
        </Box>
      )
    },
    {
      field: 'delete',
      headerName: '삭제',
      width: 80,
      cellRenderer: ({ data }: { data: MenuPermission }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Checkbox size="small" checked={data.delete} />
        </Box>
      )
    }
  ], []);

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

  // 현재 편집 중인 메뉴 데이터 또는 선택된 메뉴 데이터
  const currentMenuData = useMemo(() => {
    return isEditing ? editingMenuData : selectedMenuInfo;
  }, [isEditing, editingMenuData, selectedMenuInfo]);

  // 입력 필드 값 변경 핸들러
  const handleFieldChange = useCallback((field: keyof MenuNode, value: string | boolean | number) => {
    if (!isEditing) return;

    setEditingMenuData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [isEditing]);

  // 선택된 메뉴의 권한 정보
  const selectedMenuPermissions = useMemo(() => {
    if (!treeState.selectedNode) return [];
    return permissions.filter(p => p.menuId === treeState.selectedNode);
  }, [treeState.selectedNode, permissions]);

  // 메뉴 관리 핸들러들
  const handleAddSubMenu = useCallback(() => {
    if (!selectedMenuInfo) return;

    // 새로운 하위 메뉴 ID 생성 (부모 ID + 순차번호)
    const parentId = selectedMenuInfo.id;
    const siblingCount = selectedMenuInfo.children.length;
    const newId = `${parentId}${String(siblingCount + 1).padStart(2, '0')}`;

    // 새 메뉴 객체 생성
    const newMenu: MenuNode = {
      id: newId,
      menuName: 'New',
      description: '',
      url: '',
      parameters: '',
      order: siblingCount + 1,
      depth: selectedMenuInfo.depth + 1,
      parentId: parentId,
      children: [],
      systemCode: `NEW_MENU_${newId}`,
      menuType: 'page',
      isActive: true,
      isTestPage: false,
      requiresAuth: true,
      openInNewWindow: false,
      dashboardLayout: false,
      icon: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '관리자',
      updatedBy: '관리자'
    };

    // 1. 먼저 트리에 새 메뉴를 임시로 추가
    setMenuTree(prev => {
      const addMenuToTree = (nodes: MenuNode[]): MenuNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            // 부모 노드를 찾았으면 자식으로 추가
            return {
              ...node,
              children: [...node.children, newMenu]
            };
          } else if (node.children.length > 0) {
            // 재귀적으로 탐색
            return {
              ...node,
              children: addMenuToTree(node.children)
            };
          }
          return node;
        });
      };

      return addMenuToTree(prev);
    });

    // 2. 편집 모드로 전환하고 새 메뉴 데이터 설정
    setIsEditing(true);
    setEditingMenuData(newMenu);

    // 3. 부모 노드를 확장하여 새 메뉴를 보이게 함
    setTreeState(prev => ({
      ...prev,
      expandedNodes: new Set([...prev.expandedNodes, parentId]),
      selectedNode: newId // 새로 생성된 메뉴를 선택
    }));

    console.log('새 하위 메뉴 트리에 즉시 추가 (편집 모드):', newMenu);
    toast.success(`"${selectedMenuInfo.menuName}" 하위에 "New" 메뉴가 추가되었습니다. 정보를 입력하고 저장해주세요.`);
  }, [selectedMenuInfo, setTreeState]);

  const handleSaveMenu = useCallback(() => {
    if (isEditing && editingMenuData) {
      // 필수 필드 검증
      if (!editingMenuData.menuName || editingMenuData.menuName.trim() === '') {
        toast.warning('메뉴명을 입력해주세요.');
        return;
      }

      // 트리에서 편집 중인 메뉴의 정보를 업데이트 (이미 트리에 추가되어 있음)
      const newMenuNode = editingMenuData as MenuNode;

      setMenuTree(prev => {
        const updateMenuInTree = (nodes: MenuNode[]): MenuNode[] => {
          return nodes.map(node => {
            if (node.id === newMenuNode.id) {
              // 편집 중인 메뉴를 찾아서 업데이트
              return newMenuNode;
            } else if (node.children.length > 0) {
              // 재귀적으로 탐색
              return {
                ...node,
                children: updateMenuInTree(node.children)
              };
            }
            return node;
          });
        };

        return updateMenuInTree(prev);
      });

      // 편집 모드 해제
      setIsEditing(false);
      setEditingMenuData(null);

      console.log('새 메뉴 트리에 저장:', newMenuNode);
      toast.success('새 메뉴가 저장되었습니다.');
    } else if (selectedMenuInfo) {
      // 기존 메뉴 수정 저장
      console.log('메뉴 수정 저장:', selectedMenuInfo);
      toast.success('메뉴 정보가 저장되었습니다.');
    }
  }, [isEditing, editingMenuData, selectedMenuInfo]);

  // 편집 취소 핸들러
  const handleCancelEdit = useCallback(() => {
    if (isEditing && editingMenuData) {
      const confirmCancel = window.confirm('편집 중인 내용이 있습니다. 정말 취소하시겠습니까?');
      if (confirmCancel) {
        // 새로 추가된 메뉴를 트리에서 제거 (임시 추가된 것)
        const editingMenuId = editingMenuData.id;
        const parentId = editingMenuData.parentId;

        setMenuTree(prev => {
          const removeMenuFromTree = (nodes: MenuNode[]): MenuNode[] => {
            return nodes.map(node => {
              if (node.id === parentId) {
                // 부모 노드를 찾아서 해당 자식 제거
                return {
                  ...node,
                  children: node.children.filter(child => child.id !== editingMenuId)
                };
              } else if (node.children.length > 0) {
                // 재귀적으로 탐색
                return {
                  ...node,
                  children: removeMenuFromTree(node.children)
                };
              }
              return node;
            });
          };

          return removeMenuFromTree(prev);
        });

        setIsEditing(false);
        setEditingMenuData(null);

        // 부모 메뉴로 선택 변경
        if (parentId) {
          setTreeState(prev => ({
            ...prev,
            selectedNode: parentId
          }));
        }

        toast.info('새 메뉴 추가가 취소되었습니다.');
      }
    }
  }, [isEditing, editingMenuData]);

  const handleDeleteMenu = useCallback(() => {
    if (!selectedMenuInfo) return;

    if (selectedMenuInfo.children.length > 0) {
      toast.warning('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.');
      return;
    }

    // 확인 대화상자
    const confirmDelete = window.confirm(
      `"${selectedMenuInfo.menuName}" 메뉴를 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.`
    );

    if (!confirmDelete) return;

    // TODO: 실제로는 API 호출 후 트리에서 제거
    console.log('메뉴 삭제:', selectedMenuInfo);

    // 선택 상태 초기화
    setTreeState(prev => ({
      ...prev,
      selectedNode: null
    }));

    toast.success('메뉴가 삭제되었습니다.');
  }, [selectedMenuInfo, setTreeState]);


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
                        편집 모드
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
                          onClick={handleSaveMenu}
                          disabled={!selectedMenuInfo}
                          title={selectedMenuInfo ? '메뉴 정보를 저장합니다' : '메뉴를 선택해주세요'}
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
                          저장
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
                      {/* 첫 번째 행: 메뉴명, 식별코드 */}
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
                          label="식별코드"
                          value={currentMenuData.systemCode || ''}
                          onChange={(e) => handleFieldChange('systemCode', e.target.value)}
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
                      onClick={() => {
                        // TODO: 전체 선택 로직
                        toast.info('전체 선택');
                      }}
                      sx={{
                        mr: 0.5,
                        background: 'var(--theme-button-secondary)',
                        color: 'var(--theme-button-secondary-text)',
                        border: 'none',
                        '&:hover': {
                          background: 'var(--theme-button-secondary-hover)',
                        }
                      }}
                    >
                      전체선택
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handlePermissionSave}
                      disabled={permissionState.selectedPermissions.length === 0}
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
                      저장
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // TODO: 삭제 로직
                        toast.info('삭제');
                      }}
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
                      삭제
                    </Button>
                  </Box>
                </div>

                <div className={styles.tableContent}>
                  {selectedMenuPermissions.length > 0 ? (
                    <div style={{ height: '100%', width: '100%' }}>
                      <AgGridReact<MenuPermission>
                        rowData={selectedMenuPermissions}
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
                        선택된 메뉴의 권한 정보가 없습니다.
                      </Typography>
                    </Box>
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
