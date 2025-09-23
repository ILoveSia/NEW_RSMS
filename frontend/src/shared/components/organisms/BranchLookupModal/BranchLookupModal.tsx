import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import type { ColDef } from 'ag-grid-community';

import { Button } from '@/shared/components/atoms/Button';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { useBranchLookup } from './hooks/useBranchLookup';
import type {
  Branch,
  BranchLookupModalProps,
  BranchLookupFilters,
  BranchTypeOption
} from './types/branchLookup.types';
import styles from './BranchLookupModal.module.scss';

/**
 * 부점조회팝업 컴포넌트
 * 여러 도메인에서 공통으로 사용하는 부점 선택 팝업
 */
const BranchLookupModal: React.FC<BranchLookupModalProps> = ({
  open,
  title = '부점 조회 팝업',
  multiple = false,
  onClose,
  onSelect,
  initialFilters = {},
  excludeBranchIds = [],
  loading: externalLoading = false
}) => {
  const {
    branches,
    loading: searchLoading,
    error,
    searchBranches,
    clearResults,
    totalCount
  } = useBranchLookup();

  // Local state
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [filters, setFilters] = useState<BranchLookupFilters>({
    branchCode: '',
    branchName: '',
    branchType: '전체',
    managerName: '전체',
    ...initialFilters
  });

  const loading = searchLoading || externalLoading;

  // 본부종류 옵션
  const branchTypeOptions = useMemo<BranchTypeOption[]>(() => [
    { value: '전체', label: '전체' },
    { value: '본점', label: '본점' },
    { value: '지점', label: '지점' },
    { value: '출장소', label: '출장소' }
  ], []);

  // 폐쇄여부 옵션
  const managerOptions = useMemo<BranchTypeOption[]>(() => [
    { value: '전체', label: '전체' },
    { value: '미폐쇄', label: '미폐쇄' },
    { value: '폐쇄', label: '폐쇄' }
  ], []);

  // AG-Grid 컬럼 정의
  const columns = useMemo<ColDef<Branch>[]>(() => [
    {
      field: 'branchCode',
      headerName: '부점코드',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '600', color: '#1976d2' }
    },
    {
      field: 'branchName',
      headerName: '부점명',
      width: 150,
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'branchType',
      headerName: '본부종류',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { color: '#ed6c02', fontWeight: '500' }
    },
    {
      field: 'zipCode',
      headerName: '출장소여부',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const branch = params.data as Branch;
        return branch.branchType === '출장소' ? 'Y' : 'N';
      }
    },
    {
      field: 'managerName',
      headerName: '폐쇄일자',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const branch = params.data as Branch;
        return branch.isActive ? '미폐쇄' : '폐쇄';
      },
      cellStyle: (params: any) => {
        const branch = params.data as Branch;
        return {
          color: branch.isActive ? '#2e7d32' : '#d32f2f',
          fontWeight: '500'
        };
      }
    }
  ], []);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<BranchLookupFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  async function handleSearch() {
    await searchBranches(filters);
  }

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'branchCode',
      type: 'text',
      label: '부점코드',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchName',
      type: 'text',
      label: '부점명',
      placeholder: '부점명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchType',
      type: 'select',
      label: '본부종류',
      options: branchTypeOptions.map(option => ({ value: option.value, label: option.label })),
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'managerName',
      type: 'select',
      label: '폐쇄여부',
      options: managerOptions.map(option => ({ value: option.value, label: option.label })),
      gridSize: { xs: 12, sm: 6, md: 3 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleSearch,
        tooltip: '부점 검색'
      }
    }
  ], [branchTypeOptions, managerOptions]);

  // 필터된 부점 목록 (제외할 부점 ID 제거)
  const filteredBranches = useMemo(() => {
    if (excludeBranchIds.length === 0) return branches;
    return branches.filter(branch => !excludeBranchIds.includes(branch.id));
  }, [branches, excludeBranchIds]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: BranchLookupFilters = {
      branchCode: '',
      branchName: '',
      branchType: '전체',
      managerName: '전체'
    };
    setFilters(clearedFilters);
    clearResults();
    setSelectedBranches([]);
  }, [clearResults]);

  const handleRowClick = useCallback((branch: Branch) => {
    if (multiple) {
      setSelectedBranches(prev => {
        const exists = prev.find(item => item.id === branch.id);
        if (exists) {
          return prev.filter(item => item.id !== branch.id);
        } else {
          return [...prev, branch];
        }
      });
    } else {
      setSelectedBranches([branch]);
    }
  }, [multiple]);

  const handleRowDoubleClick = useCallback((branch: Branch) => {
    if (!multiple) {
      onSelect(branch);
      onClose();
    }
  }, [multiple, onSelect, onClose]);

  const handleSelectionChange = useCallback((selected: Branch[]) => {
    setSelectedBranches(selected);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedBranches.length === 0) {
      return;
    }

    if (multiple) {
      onSelect(selectedBranches);
    } else {
      onSelect(selectedBranches[0]);
    }
    onClose();
  }, [selectedBranches, multiple, onSelect, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedBranches([]);
    onClose();
  }, [onClose]);

  // 모달이 열릴 때 초기 검색 실행
  useEffect(() => {
    if (open) {
      handleSearch();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedBranches([]);
      clearResults();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
      <DialogContent className={styles.modalContent}>
        {/* 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<BranchLookupFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loading}
            showClearButton={true}
          />
        </div>

        {/* 검색 결과 정보 */}
        <div className={styles.resultInfo}>
          <Typography variant="body2" className={styles.resultText}>
            <SearchIcon className={styles.resultIcon} />
            부점 목록 ({totalCount}건)
          </Typography>
        </div>

        {/* 데이터 그리드 */}
        <div className={styles.gridSection}>
          <BaseDataGrid
            data={filteredBranches}
            columns={columns}
            loading={loading}
            theme="alpine"
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChange={handleSelectionChange}
            height="400px"
            pagination={false}
            rowSelection={multiple ? "multiple" : "single"}
            checkboxSelection={multiple}
            headerCheckboxSelection={multiple}
            emptyMessage={filteredBranches.length === 0 && !loading ? "조회된 정보가 없습니다." : undefined}
          />
        </div>

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
          onClick={handleConfirm}
          disabled={selectedBranches.length === 0 || loading}
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

export default React.memo(BranchLookupModal);