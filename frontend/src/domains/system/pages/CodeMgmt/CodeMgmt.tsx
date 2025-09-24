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

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  GetApp as ExcelIcon,
  Code as CodeIcon
} from '@mui/icons-material';

// 공통 컴포넌트
import { BaseSearchFilter } from '@/shared/components/organisms/BaseSearchFilter';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { FilterField } from '@/shared/components/organisms/BaseSearchFilter/BaseSearchFilter';
import type { ColDef } from 'ag-grid-community';

// 타입 및 상수 import
import type {
  CodeGroup,
  CodeDetail,
  CodeFilters,
  CodeModalState,
  SplitLayoutState
} from './types/codeMgmt.types';

import {
  MOCK_CODE_GROUPS,
  MOCK_CODE_DETAILS,
  CATEGORY_OPTIONS,
  USE_YN_OPTIONS,
  USE_YN_COLOR_MAP,
  CATEGORY_COLOR_MAP
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
  const [codeGroups] = useState<CodeGroup[]>(MOCK_CODE_GROUPS);
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
  // Search Fields Configuration
  // ===============================

  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'searchKeyword',
      type: 'text',
      label: '검색어',
      placeholder: '그룹코드, 그룹명 또는 설명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'category',
      type: 'select',
      label: '구분',
      placeholder: '구분 선택',
      options: CATEGORY_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'isActive',
      type: 'select',
      label: '사용여부',
      placeholder: '사용여부 선택',
      options: USE_YN_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], []);

  // ===============================
  // Column Definitions
  // ===============================

  // 코드 그룹 컬럼
  const groupColumns = useMemo<ColDef<CodeGroup>[]>(() => [
    {
      field: 'groupCode',
      headerName: '그룹코드',
      width: 120,
      sortable: true,
      pinned: 'left'
    },
    {
      field: 'groupName',
      headerName: '그룹명',
      width: 180,
      sortable: true,
      pinned: 'left'
    },
    {
      field: 'description',
      headerName: '설명',
      width: 200,
      sortable: false
    },
    {
      field: 'category',
      headerName: '구분',
      width: 120,
      sortable: true,
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
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: true,
      cellRenderer: (params: any) => (
        <Chip
          label={params.value === 'Y' ? '사용' : '미사용'}
          size="small"
          color={params.value === 'Y' ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    {
      field: 'sortOrder',
      headerName: '정렬순서',
      width: 100,
      sortable: true,
      type: 'number'
    },
    {
      field: 'updatedAt',
      headerName: '수정일시',
      width: 160,
      sortable: true
    }
  ], []);

  // 상세코드 컬럼
  const detailColumns = useMemo<ColDef<CodeDetail>[]>(() => [
    {
      field: 'detailCode',
      headerName: '상세코드',
      width: 120,
      sortable: true,
      pinned: 'left'
    },
    {
      field: 'detailName',
      headerName: '상세코드명',
      width: 200,
      sortable: true,
      pinned: 'left'
    },
    {
      field: 'description',
      headerName: '설명',
      width: 180,
      sortable: false
    },
    {
      field: 'sortOrder',
      headerName: '정렬순서',
      width: 100,
      sortable: true,
      type: 'number'
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: true,
      cellRenderer: (params: any) => (
        <Chip
          label={params.value === 'Y' ? '사용' : '미사용'}
          size="small"
          color={params.value === 'Y' ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    {
      field: 'updatedAt',
      headerName: '수정일시',
      width: 160,
      sortable: true
    }
  ], []);

  // ===============================
  // Event Handlers
  // ===============================

  // 검색 필터 변경
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 검색 실행
  const handleSearch = useCallback(() => {
    setLayoutState(prev => ({ ...prev, leftLoading: true }));
    // 검색 로직 (현재는 필터링만)
    setTimeout(() => {
      setLayoutState(prev => ({ ...prev, leftLoading: false }));
    }, 300);
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
              {/* 좌측 헤더 */}
              <div className={styles.leftHeader}>
                <div className={styles.filterSection}>
                  <Typography variant="h6" className={styles.sectionTitle}>
                    코드 그룹 목록
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={layoutState.leftLoading}
                    className={styles.refreshButton}
                  >
                    <RefreshIcon />
                  </IconButton>
                </div>
                <div className={styles.leftActionButtons}>
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
                  >
                    그룹 등록
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    className={styles.actionButton}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 검색 필터 */}
              <div className={styles.searchSection}>
                <BaseSearchFilter
                  fields={searchFields}
                  values={filters}
                  onValuesChange={handleFiltersChange}
                  onSearch={handleSearch}
                  loading={layoutState.leftLoading}
                />
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
                    selectedRow={layoutState.selectedCodeGroup}
                    height="100%"
                    pagination={false}
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
                    >
                      상세 등록
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                    >
                      수정
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
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
                    height="100%"
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