/**
 * 책무상세관리 DataGrid 컴포넌트
 * - AG-Grid를 사용한 책무상세 목록 표시
 * - responsibilityDetailColumns에서 함수들을 re-export
 *
 * @author Claude AI
 * @since 2025-01-06
 */

// Re-export all from responsibilityDetailColumns
export { createResponsibilityDetailColumns, convertToGridRow, isLastRowInGroup } from './responsibilityDetailColumns';
export type { ResponsibilityDetailGridRow } from './responsibilityDetailColumns';

// This file doesn't have a default export - it only re-exports named exports from responsibilityDetailColumns
