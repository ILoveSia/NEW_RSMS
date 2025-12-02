/**
 * ApprovalBox Components Index
 *
 * @description 결재함 관련 하위 컴포넌트들을 한 곳에서 export
 * - ApprovalLine 패턴을 따라 구성
 */

// 데이터 그리드 컬럼 정의
export {
  createApprovalBoxColumns,
  approvalHistoryColumns
} from './ApprovalBoxDataGrid';

// 상세 모달 (기본 export는 lazy loading에서 사용)
export { default as ApprovalDetailModal } from './ApprovalDetailModal';
