/**
 * 관리의무관리 DataGrid 컴포넌트
 * - AG-Grid를 사용한 관리의무 목록 표시
 * - BaseDataGrid를 래핑하여 사용
 *
 * @author Claude AI
 * @since 2025-01-06
 */

export { createManagementObligationColumns, convertToGridRow, isLastRowInGroup } from './managementObligationColumns';
export type { ManagementObligationGridRow } from './managementObligationColumns';
