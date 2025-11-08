/**
 * 공통 조직(부점)조회팝업 컴포넌트
 * 여러 도메인에서 공통으로 사용하는 조직 선택 팝업
 *
 * 주요 기능:
 * - 조직 목록 조회 및 검색
 * - AG-Grid를 통한 조직 표시 (조직코드, 조직명, 조직유형, 사용여부)
 * - 행 선택 및 선택 버튼 클릭으로 조직 선택
 * - 행 더블클릭으로 빠른 선택
 * - 단일 선택 모드 지원
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import { ColDef } from 'ag-grid-community';
import { toast } from 'react-toastify';

import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import Button from '@/shared/components/atoms/Button';
import { useOrganizationSearch } from './hooks/useOrganizationSearch';
import type {
  Organization,
  OrganizationSearchFilters,
  OrganizationSearchModalProps
} from './types/organizationSearch.types';
import styles from './OrganizationSearchModal.module.scss';

/**
 * 공통 조직(부점)조회팝업 컴포넌트
 */
const OrganizationSearchModal: React.FC<OrganizationSearchModalProps> = ({
  open,
  onClose,
  onSelect,
  title = '부점 조회',
  initialFilters = {}
}) => {
  // ===== Custom Hook =====
  const {
    organizations,
    loading: searchLoading,
    error,
    searchOrganizations,
    clearResults,
    totalCount
  } = useOrganizationSearch();

  // ===== Local State =====
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [filters, setFilters] = useState<OrganizationSearchFilters>({
    name: '',
    orgCode: '',
    orgType: '',
    ...initialFilters
  });

  const loading = searchLoading;

  // ===== 검색 필드 정의 =====
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'name',
      type: 'text',
      label: '조직명/조직코드',
      placeholder: '조직명 또는 조직코드를 입력하세요',
      gridSize: { xs: 12, sm: 12, md: 12 }
    }
  ], []);

  // ===== AG-Grid 컬럼 정의 (조직코드, 본부명, 조직명 3개만) =====
  const columnDefs = useMemo<ColDef<Organization>[]>(() => [
    {
      headerName: '조직코드',
      field: 'orgCode',
      width: 120,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      headerName: '본부명',
      field: 'hqName',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      valueFormatter: (params) => params.value || '-'
    },
    {
      headerName: '조직명',
      field: 'orgName',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center'
    }
  ], []);

  // ===== Event Handlers =====

  /**
   * 검색 버튼 클릭 핸들러
   */
  async function handleSearch() {
    await searchOrganizations(filters);
  }

  /**
   * 필터 변경 핸들러
   */
  const handleFiltersChange = useCallback((newFilters: Partial<OrganizationSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: OrganizationSearchFilters = {
      name: '',
      orgCode: '',
      orgType: ''
    };
    setFilters(clearedFilters);
    clearResults();
    setSelectedOrganization(null);
  }, [clearResults]);

  /**
   * 행 선택 변경 핸들러
   */
  const handleSelectionChange = useCallback((selectedRows: Organization[]) => {
    if (selectedRows.length > 0) {
      setSelectedOrganization(selectedRows[0]);
    } else {
      setSelectedOrganization(null);
    }
  }, []);

  /**
   * 행 더블클릭 핸들러 (빠른 선택)
   */
  const handleRowDoubleClick = useCallback((data: Organization) => {
    if (data) {
      onSelect(data);
      onClose();
    }
  }, [onSelect, onClose]);

  /**
   * 선택 버튼 클릭 핸들러
   */
  const handleSelectClick = useCallback(() => {
    if (selectedOrganization) {
      onSelect(selectedOrganization);
      onClose();
    } else {
      toast.warning('조직을 선택해주세요.');
    }
  }, [selectedOrganization, onSelect, onClose]);

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = useCallback(() => {
    setSelectedOrganization(null);
    onClose();
  }, [onClose]);

  // ===== Effects =====

  /**
   * 다이얼로그 열릴 때 조직 목록 조회
   */
  useEffect(() => {
    if (open) {
      handleSearch();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedOrganization(null);
      clearResults();
    }
  }, [open]);

  // ===== 렌더링 =====
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.modal}
      PaperProps={{
        className: styles.modalPaper
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle className={styles.modalTitle}>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon className={styles.titleIcon} />
          <Typography variant="h6" component="span" className={styles.titleText}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          className={styles.closeButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 모달 콘텐츠 */}
      <DialogContent dividers className={styles.modalContent}>
        {/* 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<OrganizationSearchFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loading}
            showClearButton={false}
          />
        </div>

        {/* 검색 결과 정보 */}
        <div className={styles.resultInfo}>
          <Typography variant="body2" className={styles.resultText}>
            <SearchIcon className={styles.resultIcon} />
            조직 목록 ({totalCount}건)
          </Typography>
        </div>

        {/* 조직 목록 그리드 */}
        <div className={styles.gridSection}>
          {loading ? (
            <Box className={styles.loadingBox}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                조직 목록을 불러오는 중...
              </Typography>
            </Box>
          ) : (
            <BaseDataGrid
              data={organizations}
              columns={columnDefs}
              rowSelection="single"
              onSelectionChange={handleSelectionChange}
              onRowClick={(data) => setSelectedOrganization(data)}
              onRowDoubleClick={handleRowDoubleClick}
              height="350px"
              emptyMessage="조회된 조직이 없습니다."
              theme="alpine"
              pagination={false}
            />
          )}
        </div>

        {/* 선택된 조직 정보 */}
        {selectedOrganization && (
          <Box className={styles.selectedInfo}>
            <Typography variant="body2" color="primary" fontWeight={500}>
              선택된 조직: {selectedOrganization.orgName} ({selectedOrganization.orgCode})
            </Typography>
          </Box>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Box className={styles.errorMessage}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions className={styles.modalActions}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSelectClick}
          disabled={!selectedOrganization || loading}
          startIcon="Check"
        >
          확인
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          startIcon="Close"
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(OrganizationSearchModal);
