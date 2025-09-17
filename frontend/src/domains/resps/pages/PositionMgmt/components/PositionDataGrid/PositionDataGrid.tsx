import { Box, Chip } from '@mui/material';
import { CellClickedEvent, ColDef, RowDoubleClickedEvent } from 'ag-grid-community';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// AG-Grid CSS imports
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { Position } from '../../types/position.types';
import styles from './PositionDataGrid.module.scss';

export interface PositionDataGridProps {
  /** 직책 데이터 배열 */
  data: Position[];
  /** 로딩 상태 */
  loading?: boolean;
  /** 행 클릭 이벤트 */
  onRowClick?: (position: Position) => void;
  /** 행 더블클릭 이벤트 (상세보기) */
  onRowDoubleClick?: (position: Position) => void;
  /** 선택된 행 변경 이벤트 */
  onSelectionChange?: (selectedPositions: Position[]) => void;
  /** 그리드 높이 */
  height?: string | number;
  /** 커스텀 className */
  className?: string;
}

/**
 * PositionDataGrid - 직책 데이터를 표시하는 AG-Grid 컴포넌트
 *
 * 기능:
 * - 직책 목록 표시
 * - 정렬, 필터링, 페이징
 * - 행 선택 및 이벤트 처리
 * - 상태별 시각적 표시
 *
 * @example
 * <PositionDataGrid
 *   data={positions}
 *   loading={loading}
 *   onRowDoubleClick={handleDetailView}
 *   onSelectionChange={handleSelection}
 * />
 */
const PositionDataGrid: React.FC<PositionDataGridProps> = ({
  data,
  loading = false,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  height = 500,
  className
}) => {
  const { t } = useTranslation('resps');

  // 상태별 색상 매핑
  const getStatusColor = useCallback((status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case '승인':
        return 'success';
      case '대기':
        return 'warning';
      case '반려':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // 사용여부별 색상 매핑
  const getActiveColor = useCallback((isActive: boolean): 'success' | 'error' => {
    return isActive ? 'success' : 'error';
  }, []);

  // AG-Grid 컬럼 정의
  const columnDefs = useMemo<ColDef<Position>[]>(() => [
    {
      headerName: t('직책'),
      field: 'positionName',
      sortable: true,
      filter: true,
      width: 150,
      pinned: 'left',
      cellClass: styles.positionNameCell
    },
    {
      headerName: t('본부구분'),
      field: 'headquarters',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: t('부서명'),
      field: 'departmentName',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: t('부점명'),
      field: 'divisionName',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: t('상태'),
      field: 'status',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        return (
          <Box className={styles.chipContainer}>
            <Chip
              label={params.value}
              color={getStatusColor(params.value)}
              size="small"
              variant="filled"
            />
          </Box>
        );
      }
    },
    {
      headerName: t('활성여부'),
      field: 'isActive',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        const isActive = params.value;
        const label = isActive ? t('common.active') : t('common.inactive');
        return (
          <Box className={styles.chipContainer}>
            <Chip
              label={label}
              color={getActiveColor(isActive)}
              size="small"
              variant="outlined"
            />
          </Box>
        );
      }
    },
    {
      headerName: t('결재상태'),
      field: 'approvalStatus',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        return (
          <Box className={styles.chipContainer}>
            <Chip
              label={params.value}
              color={getStatusColor(params.value)}
              size="small"
              variant="outlined"
            />
          </Box>
        );
      }
    },
    {
      headerName: t('등록일자'),
      field: 'registrationDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 130,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('ko-KR');
      }
    },
    {
      headerName: t('등록자'),
      field: 'registrar',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: t('변경자'),
      field: 'registrarPosition',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: t('변경일자'),
      field: 'modificationDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 130,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('ko-KR');
      }
    },
    {
      headerName: t('변경자'),
      field: 'modifier',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: t('변경자직책'),
      field: 'modifierPosition',
      sortable: true,
      filter: true,
      width: 130
    }
  ], [t, getStatusColor, getActiveColor]);

  // 행 클릭 핸들러
  const handleRowClick = useCallback((position: Position, event: CellClickedEvent<Position>) => {
    onRowClick?.(position);
  }, [onRowClick]);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback((position: Position, event: RowDoubleClickedEvent<Position>) => {
    onRowDoubleClick?.(position);
  }, [onRowDoubleClick]);

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback((selectedRows: Position[]) => {
    onSelectionChange?.(selectedRows);
  }, [onSelectionChange]);

  return (
    <div className={styles.container}>
      <BaseDataGrid<Position>
        data={data}
        columns={columnDefs}
        loading={loading}
        height={height}
        theme="alpine"
        pagination
        pageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        rowSelection="multiple"
        checkboxSelection
        headerCheckboxSelection
        enableFilter
        enableSorting
        enableColumnResize
        enableColumnReorder
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onSelectionChange={handleSelectionChange}
        emptyMessage={t('position.grid.noData')}
        className={className}
        data-testid="position-data-grid"
      />
    </div>
  );
};

export default PositionDataGrid;
