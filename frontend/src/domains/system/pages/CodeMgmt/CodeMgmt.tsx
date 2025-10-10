/**
 * 코드관리 메인 페이지
 *
 * @description 공통코드 그룹 및 상세코드 관리를 위한 좌우 분할 레이아웃 페이지
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 *
 * @features
 * - 좌측: 코드 그룹 관리 (필터링, 목록, CRUD)
 * - 우측: 선택된 그룹의 상세코드 관리 (목록, CRUD, 순서변경)
 * - PositionMgmt.tsx 표준 템플릿 pageHeader 스타일 적용
 * - ApprovalLine 좌우 분할 레이아웃 패턴 적용
 */

import {
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  GetApp as ExcelIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// 공통 컴포넌트
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { ColDef } from 'ag-grid-community';

// 타입 및 상수 import
import type {
  CodeDetail,
  CodeFilters,
  CodeGroup,
  CodeModalState,
  SplitLayoutState
} from './types/codeMgmt.types';

import {
  CATEGORY_COLOR_MAP,
  CATEGORY_OPTIONS,
  MOCK_CODE_DETAILS,
  MOCK_CODE_GROUPS
} from './types/codeMgmt.types';


// 스타일 import
import styles from './CodeMgmt.module.scss';

/**
 * 코드관리 메인 컴포넌트
 */
const CodeMgmt: React.FC = () => {
  // ===============================
  // State Management
  // ===============================

  // 필터 상태
  const [filters, setFilters] = useState<CodeFilters>({
    groupCode: '',
    category: '',
    searchKeyword: '',
    isActive: ''
  });

  // 분할 레이아웃 상태
  const [layoutState, setLayoutState] = useState<SplitLayoutState>({
    selectedCodeGroup: null,
    leftLoading: false,
    rightLoading: false
  });

  // 모달 상태
  const [modalState, setModalState] = useState<CodeModalState>({
    groupModal: false,
    detailModal: false,
    mode: 'create',
    groupData: null,
    detailData: null
  });

  // 데이터 상태
  const [codeGroups, setCodeGroups] = useState<CodeGroup[]>(MOCK_CODE_GROUPS);
  const [codeDetails, setCodeDetails] = useState<CodeDetail[]>([]);

  // ===============================
  // Computed Values
  // ===============================

  // 필터링된 코드 그룹
  const filteredGroups = useMemo(() => {
    return codeGroups.filter(group => {
      if (filters.category && group.category !== filters.category) return false;
      if (filters.isActive && group.isActive !== filters.isActive) return false;
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase();
        return (
          group.groupName.toLowerCase().includes(keyword) ||
          group.groupCode.toLowerCase().includes(keyword) ||
          (group.description && group.description.toLowerCase().includes(keyword))
        );
      }
      return true;
    });
  }, [codeGroups, filters]);

  // 선택된 그룹의 상세코드
  const selectedGroupDetails = useMemo(() => {
    if (!layoutState.selectedCodeGroup) return [];
    return codeDetails.filter(detail =>
      detail.groupCode === layoutState.selectedCodeGroup?.groupCode
    );
  }, [codeDetails, layoutState.selectedCodeGroup]);

  // 통계 정보
  const statistics = useMemo(() => {
    const totalGroups = codeGroups.length;
    const activeGroups = codeGroups.filter(g => g.isActive === 'Y').length;
    const selectedGroupDetailCount = selectedGroupDetails.length;
    const activeDetails = selectedGroupDetails.filter(d => d.isActive === 'Y').length;

    return {
      totalGroups,
      activeGroups,
      selectedGroupDetailCount,
      activeDetails
    };
  }, [codeGroups, selectedGroupDetails]);


  // ===============================
  // Column Definitions
  // ===============================

  // 코드 그룹 컬럼 (인라인 편집 가능)
  const groupColumns = useMemo<ColDef<CodeGroup>[]>(() => [
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const status = params.value || '저장';
        return (
          <Chip
            label={status}
            size="small"
            color={status === '저장' ? 'primary' : 'warning'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'sortOrder',
      headerName: '순서',
      width: 80,
      sortable: true,
      type: 'number',
      editable: false, // 자동 증가이므로 편집 불가
    },
    {
      field: 'category',
      headerName: '구분',
      width: 120,
      sortable: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: CATEGORY_OPTIONS.map(opt => opt.value)
      },
      cellRenderer: (params: any) => (
        <Chip
          label={params.value}
          size="small"
          style={{
            backgroundColor: CATEGORY_COLOR_MAP[params.value as keyof typeof CATEGORY_COLOR_MAP],
            color: 'white'
          }}
        />
      )
    },
    {
      field: 'groupCode',
      headerName: '그룹코드',
      width: 120,
      sortable: true,
      editable: true,
    },
    {
      field: 'groupName',
      headerName: '그룹코드명',
      width: 180,
      sortable: true,
      editable: true,
    },
    {
      field: 'description',
      headerName: '설명',
      width: 200,
      sortable: false,
      editable: true,
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: true,
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
    }
  ], []);

  // 상세코드 컬럼 (인라인 편집 가능)
  const detailColumns = useMemo<ColDef<CodeDetail>[]>(() => [
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const status = params.value || '저장';
        return (
          <Chip
            label={status}
            size="small"
            color={status === '저장' ? 'primary' : 'warning'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'sortOrder',
      headerName: '순서',
      width: 80,
      sortable: true,
      type: 'number',
      editable: false, // 자동 증가이므로 편집 불가
    },
    {
      field: 'detailCode',
      headerName: '코드',
      width: 120,
      sortable: true,
      editable: true,
    },
    {
      field: 'detailName',
      headerName: '코드명',
      width: 200,
      sortable: true,
      editable: true,
    },
    {
      field: 'description',
      headerName: '설명',
      width: 180,
      sortable: false,
      editable: true,
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: true,
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
    }
  ], []);

  // ===============================
  // Event Handlers
  // ===============================

  // 검색 필터 변경 (자동 필터링)
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 그룹 선택
  const handleGroupSelect = useCallback((group: CodeGroup) => {
    setLayoutState(prev => ({
      ...prev,
      selectedCodeGroup: group,
      rightLoading: true
    }));

    // 상세코드 로딩 시뮬레이션
    setTimeout(() => {
      const groupDetails = MOCK_CODE_DETAILS.filter(detail =>
        detail.groupCode === group.groupCode
      );
      setCodeDetails(groupDetails);
      setLayoutState(prev => ({ ...prev, rightLoading: false }));
    }, 300);
  }, []);

  // 새로고침
  const handleRefresh = useCallback(() => {
    setLayoutState(prev => ({ ...prev, leftLoading: true }));
    setTimeout(() => {
      setLayoutState(prev => ({ ...prev, leftLoading: false }));
    }, 500);
  }, []);

  // 그룹 추가
  const handleAddGroup = useCallback(() => {
    // 현재 최대 순서 찾기
    const maxOrder = codeGroups.length > 0
      ? Math.max(...codeGroups.map(g => g.sortOrder))
      : 0;

    const newGroup: CodeGroup = {
      status: '저장', // 새로 추가된 행은 '저장' 상태
      groupCode: `NEW_${Date.now()}`,
      groupName: '',
      description: '',
      category: '시스템 공통',
      categoryCode: 'SYSTEM',
      systemCode: false,
      editable: true,
      sortOrder: maxOrder + 1, // 자동 증가
      isActive: 'Y',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
    setCodeGroups(prev => [newGroup, ...prev]);
  }, [codeGroups]);

  // 상세 추가
  const handleAddDetail = useCallback(() => {
    if (!layoutState.selectedCodeGroup) return;

    // 현재 최대 순서 찾기
    const maxOrder = codeDetails.length > 0
      ? Math.max(...codeDetails.map(d => d.sortOrder))
      : 0;

    const newDetail: CodeDetail = {
      status: '저장', // 새로 추가된 행은 '저장' 상태
      groupCode: layoutState.selectedCodeGroup.groupCode,
      detailCode: `NEW_${Date.now()}`,
      detailName: '',
      description: '',
      parentCode: undefined,
      levelDepth: 1,
      sortOrder: maxOrder + 1, // 자동 증가
      extAttr1: undefined,
      extAttr2: undefined,
      extAttr3: undefined,
      extraData: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isActive: 'Y',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
    setCodeDetails(prev => [newDetail, ...prev]);
  }, [layoutState.selectedCodeGroup, codeDetails]);

  // 그룹 셀 값 변경
  const handleGroupCellValueChanged = useCallback((event: any) => {
    const updatedGroup = event.data as CodeGroup;
    setCodeGroups(prev =>
      prev.map(group =>
        group.groupCode === updatedGroup.groupCode
          ? {
              ...updatedGroup,
              status: '수정', // 셀 값이 변경되면 '수정' 상태로 변경
              updatedAt: new Date().toISOString()
            }
          : group
      )
    );
    console.log('그룹 수정됨:', updatedGroup);
  }, []);

  // 상세 셀 값 변경
  const handleDetailCellValueChanged = useCallback((event: any) => {
    const updatedDetail = event.data as CodeDetail;
    setCodeDetails(prev =>
      prev.map(detail =>
        detail.detailCode === updatedDetail.detailCode && detail.groupCode === updatedDetail.groupCode
          ? {
              ...updatedDetail,
              status: '수정', // 셀 값이 변경되면 '수정' 상태로 변경
              updatedAt: new Date().toISOString()
            }
          : detail
      )
    );
    console.log('상세 수정됨:', updatedDetail);
  }, []);

  // 그룹 삭제
  const handleDeleteGroups = useCallback(() => {
    // TODO: 선택된 행 삭제 로직 구현
    console.log('그룹 삭제');
  }, []);

  // 상세 삭제
  const handleDeleteDetails = useCallback(() => {
    // TODO: 선택된 행 삭제 로직 구현
    console.log('상세 삭제');
  }, []);

  // ===============================
  // Effects
  // ===============================

  // 첫 번째 그룹 자동 선택
  useEffect(() => {
    if (filteredGroups.length > 0 && !layoutState.selectedCodeGroup) {
      handleGroupSelect(filteredGroups[0]);
    }
  }, [filteredGroups, layoutState.selectedCodeGroup, handleGroupSelect]);

  // ===============================
  // Render
  // ===============================

  return (
    <div className={styles.container}>
      {/* Page Header (PositionMgmt 표준 템플릿) */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <CodeIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>코드관리</h1>
              <p className={styles.pageDescription}>
                시스템 공통코드 및 업무코드를 통합 관리합니다
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SettingsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalGroups}</div>
                <div className={styles.statLabel}>전체 그룹</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CodeIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeGroups}</div>
                <div className={styles.statLabel}>사용중</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AddIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.selectedGroupDetailCount}</div>
                <div className={styles.statLabel}>상세코드</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* 좌측 패널 - 코드 그룹 관리 */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.leftPanel}>
              {/* 좌측 헤더 + 검색 필터 한줄 통합 */}
              <div className={styles.leftHeader}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  코드 그룹 목록
                </Typography>
                <TextField
                  size="small"
                  placeholder="그룹코드, 그룹명 또는 설명을 입력하세요"
                  value={filters.searchKeyword}
                  onChange={(e) => handleFiltersChange({ searchKeyword: e.target.value })}
                  disabled={layoutState.leftLoading}
                  className={styles.searchField}
                />
                <FormControl size="small" className={styles.selectField}>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFiltersChange({ category: e.target.value })}
                    disabled={layoutState.leftLoading}
                    displayEmpty
                  >
                    <MenuItem value="">전체</MenuItem>
                    {CATEGORY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  disabled={layoutState.leftLoading}
                  className={styles.refreshButton}
                >
                  <RefreshIcon />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ExcelIcon />}
                  className={styles.actionButton}
                >
                  엑셀다운로드
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  className={styles.actionButton}
                  onClick={handleAddGroup}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  className={styles.actionButton}
                  onClick={handleDeleteGroups}
                >
                  삭제
                </Button>
              </div>

              {/* 그룹 목록 그리드 */}
              <div className={styles.leftGrid}>
                {layoutState.leftLoading ? (
                  <Box p={2}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={filteredGroups}
                    columns={groupColumns}
                    onRowClick={handleGroupSelect}
                    onCellValueChanged={handleGroupCellValueChanged}
                    height="calc(100vh - 290px)"
                    pagination={false}
                    rowSelection="single"
                  />
                )}
              </div>
            </Paper>
          </Grid>

          {/* 우측 패널 - 상세코드 관리 */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.rightPanel}>
              {/* 우측 헤더 */}
              <div className={styles.rightHeader}>
                <div className={styles.selectedGroupInfo}>
                  {layoutState.selectedCodeGroup ? (
                    <>
                      <Typography variant="h6" className={styles.sectionTitle}>
                        [{layoutState.selectedCodeGroup.groupCode}] 상세코드 목록
                      </Typography>
                      <Chip
                        label={layoutState.selectedCodeGroup.category}
                        size="small"
                        style={{
                          backgroundColor: CATEGORY_COLOR_MAP[layoutState.selectedCodeGroup.category],
                          color: 'white',
                          marginLeft: '8px'
                        }}
                      />
                    </>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      코드 그룹을 선택하세요
                    </Typography>
                  )}
                </div>
                <div className={styles.rightActions}>
                  <div className={styles.orderButtons}>
                    <IconButton size="small" className={styles.orderButton}>
                      <ArrowUpIcon />
                    </IconButton>
                    <IconButton size="small" className={styles.orderButton}>
                      <ArrowDownIcon />
                    </IconButton>
                  </div>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                      onClick={handleAddDetail}
                    >
                      추가
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                      onClick={handleDeleteDetails}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>

              {/* 상세코드 목록 그리드 */}
              <div className={styles.rightGrid}>
                {!layoutState.selectedCodeGroup ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="info">
                      좌측에서 코드 그룹을 선택하면 상세코드 목록을 확인할 수 있습니다.
                    </Alert>
                  </Box>
                ) : layoutState.rightLoading ? (
                  <Box p={2}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : selectedGroupDetails.length === 0 ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="warning">
                      선택된 그룹에 등록된 상세코드가 없습니다.
                    </Alert>
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={selectedGroupDetails}
                    columns={detailColumns}
                    onCellValueChanged={handleDetailCellValueChanged}
                    height="calc(100vh - 290px)"
                    pagination={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default CodeMgmt;
