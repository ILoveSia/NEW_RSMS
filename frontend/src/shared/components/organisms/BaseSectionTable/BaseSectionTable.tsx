import React, { useCallback, useState } from 'react';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import { ColDef } from 'ag-grid-community';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import styles from './BaseSectionTable.module.scss';

export interface BaseSectionTableProps<TData = any> {
  /** 섹션 제목 */
  title: string;
  /** 테이블 데이터 */
  data: TData[];
  /** 컬럼 정의 */
  columns: ColDef<TData>[];
  /** 로딩 상태 */
  loading?: boolean;
  /** 추가 버튼 표시 여부 */
  showAddButton?: boolean;
  /** 저장 버튼 표시 여부 */
  showSaveButton?: boolean;
  /** 추가 버튼 클릭 핸들러 */
  onAdd?: () => void;
  /** 저장 버튼 클릭 핸들러 */
  onSave?: () => void;
  /** 행 선택 변경 핸들러 */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 높이 */
  height?: string | number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 테스트 ID */
  'data-testid'?: string;
}

/**
 * BaseSectionTable - 섹션별 테이블을 위한 공통 컴포넌트
 *
 * ResponsibilityMgmt의 3단계 섹션 (책무/책무세부내용/관리의무)에서 재사용
 *
 * @example
 * <BaseSectionTable
 *   title="책무"
 *   data={responsibilities}
 *   columns={responsibilityColumns}
 *   showAddButton
 *   showSaveButton
 *   onAdd={handleAddResponsibility}
 *   onSave={handleSaveResponsibilities}
 * />
 */
const BaseSectionTable = <TData = any,>({
  title,
  data,
  columns,
  loading = false,
  showAddButton = false,
  showSaveButton = false,
  onAdd,
  onSave,
  onSelectionChange,
  emptyMessage = '등록된 데이터가 없습니다.',
  height = 300,
  className,
  'data-testid': dataTestId = 'base-section-table'
}: BaseSectionTableProps<TData>) => {
  const [selectedRows, setSelectedRows] = useState<TData[]>([]);

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback((newSelectedRows: TData[]) => {
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  }, [onSelectionChange]);

  // 추가 버튼 클릭 핸들러
  const handleAddClick = useCallback(() => {
    onAdd?.();
  }, [onAdd]);

  // 저장 버튼 클릭 핸들러
  const handleSaveClick = useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={dataTestId}>
      {/* 섹션 헤더 */}
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.actions}>
          {showAddButton && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={loading}
              data-testid={`${dataTestId}-add-button`}
            >
              추가
            </Button>
          )}
          {showSaveButton && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              disabled={loading || data.length === 0}
              data-testid={`${dataTestId}-save-button`}
            >
              저장
            </Button>
          )}
        </div>
      </div>

      {/* 테이블 컨테이너 */}
      <div className={styles.tableContainer}>
        <BaseDataGrid
          data={data}
          columns={columns}
          loading={loading}
          height={height}
          theme="rsms"
          rowSelection="multiple"
          checkboxSelection
          onSelectionChange={handleSelectionChange}
          emptyMessage={emptyMessage}
          className={styles.dataGrid}
          data-testid={`${dataTestId}-grid`}
        />
      </div>

      {/* 선택 정보 */}
      {selectedRows.length > 0 && (
        <div className={styles.selectionInfo}>
          <span className={styles.selectionText}>
            {selectedRows.length}개 항목이 선택되었습니다.
          </span>
        </div>
      )}
    </div>
  );
};

export default BaseSectionTable;