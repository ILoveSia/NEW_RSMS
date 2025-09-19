import React from 'react';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { ResponsibilityDoc } from '../../types/responsibilityDoc.types';
import { responsibilityDocColumns } from './responsibilityDocColumns';
import styles from './ResponsibilityDocDataGrid.module.scss';

interface ResponsibilityDocDataGridProps {
  data: ResponsibilityDoc[];
  loading?: boolean;
  onRowClick?: (doc: ResponsibilityDoc) => void;
  onSelectionChanged?: (selectedDocs: ResponsibilityDoc[]) => void;
  className?: string;
}

const ResponsibilityDocDataGrid: React.FC<ResponsibilityDocDataGridProps> = ({
  data,
  loading = false,
  onRowClick,
  onSelectionChanged,
  className
}) => {
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
      />
    </div>
  );
};

export default ResponsibilityDocDataGrid;