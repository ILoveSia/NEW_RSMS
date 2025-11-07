import React from 'react';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { ResponsibilityDoc } from '../../types/responsibilityDoc.types';
import { responsibilityDocColumns } from './responsibilityDocColumns';
import styles from './ResponsibilityDocDataGrid.module.scss';

interface ResponsibilityDocDataGridProps {
  data: ResponsibilityDoc[];
  loading?: boolean;
  onRowClick?: (doc: ResponsibilityDoc) => void;
  onPositionClick?: (doc: ResponsibilityDoc) => void; // 직책 컬럼 클릭 핸들러
  onSelectionChanged?: (selectedDocs: ResponsibilityDoc[]) => void;
  className?: string;
}

/**
 * 책무기술서 데이터 그리드 컴포넌트
 * - "직책" 컬럼 클릭 시 상세조회 모달 열기
 */
const ResponsibilityDocDataGrid: React.FC<ResponsibilityDocDataGridProps> = ({
  data,
  loading = false,
  onRowClick,
  onPositionClick,
  onSelectionChanged,
  className
}) => {
  // AG-Grid context에 직책 클릭 핸들러 전달
  const gridContext = React.useMemo(() => ({
    onPositionClick: onPositionClick
  }), [onPositionClick]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <BaseDataGrid
        data={data}
        columns={responsibilityDocColumns}
        loading={loading}
        pagination={true}
        pageSize={20}
        onRowClick={onRowClick}
        onSelectionChanged={onSelectionChanged}
        theme="rsms"
        rowSelection="multiple"
        context={gridContext}
      />
    </div>
  );
};

export default ResponsibilityDocDataGrid;