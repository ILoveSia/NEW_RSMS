/**
 * LedgerOrderComboBox 타입 정의
 *
 * @description 원장차수 콤보박스 컴포넌트의 타입 정의
 * @author Claude AI
 * @since 2025-10-16
 */

/**
 * 백엔드 API 응답 타입 (LedgerOrderComboDto)
 */
export interface LedgerOrderComboDto {
  /** 원장차수ID (예: 20250001) */
  ledgerOrderId: string;

  /** 원장 제목 (예: 1차점검이행) */
  ledgerOrderTitle: string;

  /** 원장상태 (PROG: 진행중, CLSD: 종료) */
  ledgerOrderStatus: 'PROG' | 'CLSD';

  /** 콤보박스 표시용 라벨 (포맷팅됨)
   * - PROG: "20250001-1차점검이행[진행중]"
   * - CLSD: "20250001-1차점검이행"
   */
  displayLabel: string;
}

/**
 * LedgerOrderComboBox 컴포넌트 Props
 */
export interface LedgerOrderComboBoxProps {
  /** 선택된 원장차수ID */
  value?: string;

  /** 선택 변경 핸들러 */
  onChange: (ledgerOrderId: string | null) => void;

  /** 플레이스홀더 텍스트 */
  placeholder?: string;

  /** 비활성화 여부 */
  disabled?: boolean;

  /** 에러 상태 */
  error?: boolean;

  /** 도움말 텍스트 */
  helperText?: string;

  /** 필수 여부 */
  required?: boolean;

  /** 추가 CSS 클래스명 */
  className?: string;

  /** 라벨 텍스트 */
  label?: string;

  /** 크기 (기본값: medium) */
  size?: 'small' | 'medium';

  /** 전체 너비 사용 여부 (기본값: true) */
  fullWidth?: boolean;
}
