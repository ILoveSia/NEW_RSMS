/**
 * 공통 직책조회팝업 컴포넌트
 * 여러 도메인에서 공통으로 사용하는 직책 선택 팝업
 *
 * 주요 기능:
 * - 직책 목록 조회 및 검색
 * - AG-Grid를 통한 직책 표시 (직책명, 본부명, 겸직여부)
 * - 행 선택 및 선택 버튼 클릭으로 직책 선택
 * - 행 더블클릭으로 빠른 선택
 * - 단일/다중 선택 모드 지원
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
import BadgeIcon from '@mui/icons-material/Badge';
import { ColDef } from 'ag-grid-community';
import { toast } from 'react-toastify';

import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import Button from '@/shared/components/atoms/Button';
import { usePositionLookup } from './hooks/usePositionLookup';
import type {
  Position,
  PositionSearchFilter,
  PositionLookupModalProps
} from './types/positionLookup.types';
import styles from './PositionLookupModal.module.scss';

/**
 * 공통 직책조회팝업 컴포넌트
 */
const PositionLookupModal: React.FC<PositionLookupModalProps> = ({
  open,
  onClose,
  onSelect,
  title = '직책 조회 팝업',
  singleSelection = true,
  initialFilter = {}
}) => {
  // ===== Custom Hook =====
  const {
    positions,
    loading: searchLoading,
    error,
    searchPositions,
    clearResults,
    totalCount
  } = usePositionLookup();

  // ===== Local State =====
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [filters, setFilters] = useState<PositionSearchFilter>({
    positionName: '',
    hqName: '',
    isConcurrent: '',
    isActive: '',
    ...initialFilter
  });

  const loading = searchLoading;

  // ===== 검색 필드 정의 =====
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, sm: 12, md: 12 }
    }
  ], []);

  // ===== AG-Grid 컬럼 정의 =====
  const columnDefs = useMemo<ColDef<Position>[]>(() => [
    {
      headerName: '순번',
      width: 80,
      valueGetter: (params) => {
        const index = positions.findIndex(p => p.positionId === params.data?.positionId);
        return index >= 0 ? index + 1 : '';
      },
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      headerName: '직책명',
      field: 'positionName',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-left',
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
      headerClass: 'ag-header-center'
    },
    {
      headerName: '겸직여부',
      field: 'isConcurrent',
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value === 'Y' ? '겸직' : '전임';
      },
      cellStyle: (params: any) => {
        const color = params.value === 'Y' ? '#ff9800' : '#4caf50';
        return {
          color,
          fontWeight: '500',
          textAlign: 'center'
        };
      },
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    }
  ], [positions]);

  // ===== Event Handlers =====

  /**
   * 검색 버튼 클릭 핸들러
   */
  async function handleSearch() {
    await searchPositions(filters);
  }

  /**
   * 필터 변경 핸들러
   */
  const handleFiltersChange = useCallback((newFilters: Partial<PositionSearchFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: PositionSearchFilter = {
      positionName: '',
      hqName: '',
      isConcurrent: '',
      isActive: ''
    };
    setFilters(clearedFilters);
    clearResults();
    setSelectedPosition(null);
  }, [clearResults]);

  /**
   * 행 선택 변경 핸들러
   */
  const handleSelectionChange = useCallback((selectedRows: Position[]) => {
    if (selectedRows.length > 0) {
      setSelectedPosition(selectedRows[0]);
    } else {
      setSelectedPosition(null);
    }
  }, []);

  /**
   * 행 더블클릭 핸들러 (빠른 선택)
   */
  const handleRowDoubleClick = useCallback((data: Position) => {
    if (data) {
      onSelect(data);
      onClose();
    }
  }, [onSelect, onClose]);

  /**
   * 선택 버튼 클릭 핸들러
   */
  const handleSelectClick = useCallback(() => {
    if (selectedPosition) {
      onSelect(selectedPosition);
      onClose();
    } else {
      toast.warning('직책을 선택해주세요.');
    }
  }, [selectedPosition, onSelect, onClose]);

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = useCallback(() => {
    setSelectedPosition(null);
    onClose();
  }, [onClose]);

  // ===== Effects =====

  /**
   * 다이얼로그 열릴 때 직책 목록 조회
   */
  useEffect(() => {
    if (open) {
      handleSearch();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedPosition(null);
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
          <BadgeIcon className={styles.titleIcon} />
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PositionSearchFilter>)}
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
            직책 목록 ({totalCount}건)
          </Typography>
        </div>

        {/* 직책 목록 그리드 */}
        <div className={styles.gridSection}>
          {loading ? (
            <Box className={styles.loadingBox}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                직책 목록을 불러오는 중...
              </Typography>
            </Box>
          ) : (
            <BaseDataGrid
              data={positions}
              columns={columnDefs}
              rowSelection={singleSelection ? 'single' : 'multiple'}
              onSelectionChange={handleSelectionChange}
              onRowDoubleClick={handleRowDoubleClick}
              height="350px"
              emptyMessage="조회된 직책이 없습니다."
              theme="alpine"
              pagination={false}
            />
          )}
        </div>

        {/* 선택된 직책 정보 */}
        {selectedPosition && (
          <Box className={styles.selectedInfo}>
            <Typography variant="body2" color="primary" fontWeight={500}>
              선택된 직책: {selectedPosition.positionName}
              {selectedPosition.hqName && ` (${selectedPosition.hqName})`}
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
          disabled={!selectedPosition || loading}
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

export default React.memo(PositionLookupModal);
