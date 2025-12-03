/**
 * InspectionPlanComboBox 타입 정의
 *
 * @description 점검명 콤보박스 컴포넌트 타입
 * @author Claude AI
 * @since 2025-12-03
 */

/**
 * 점검계획 콤보박스용 DTO
 * - impl_inspection_plans 테이블 데이터 기반
 */
export interface InspectionPlanComboDto {
  /** 이행점검계획ID (PK) */
  implInspectionPlanId: string;
  /** 점검명 */
  implInspectionName: string;
  /** 원장차수ID */
  ledgerOrderId: string;
  /** 점검유형코드 (REGU: 정기, SPEC: 수시) */
  inspectionTypeCd?: string;
  /** 점검시작일 */
  implInspectionStartDate?: string;
  /** 점검종료일 */
  implInspectionEndDate?: string;
  /** 콤보박스 표시 라벨 */
  displayLabel?: string;
}

/**
 * InspectionPlanComboBox 컴포넌트 Props
 */
export interface InspectionPlanComboBoxProps {
  /** 선택된 이행점검계획ID */
  value: string | null;
  /** 선택 변경 콜백 */
  onChange: (value: string | null) => void;
  /** 원장차수ID (필수 조건) */
  ledgerOrderId: string | null;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 커스텀 className */
  className?: string;
  /** 라벨 텍스트 */
  label?: string;
  /** 컴포넌트 크기 */
  size?: 'small' | 'medium';
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** "전체" 옵션 표시 여부 */
  showAllOption?: boolean;
}
