/**
 * PositionNameComboBox 타입 정의
 *
 * @description 직책명 콤보박스 컴포넌트의 타입 정의
 * @author Claude AI
 * @since 2025-10-17
 */

/**
 * 백엔드 API 응답 타입 (CommonCodeDetailDto)
 * - Backend 필드명에 맞춤: detailCode, detailName, isActive
 */
export interface PositionNameDto {
  /** 상세코드 (직책명 코드) */
  detailCode: string;

  /** 상세코드명 (직책명) */
  detailName: string;

  /** 정렬순서 */
  sortOrder: number;

  /** 사용여부 (Backend: "Y"/"N" String) */
  isActive: string;
}

/**
 * PositionNameComboBox 컴포넌트 Props
 */
export interface PositionNameComboBoxProps {
  /** 선택된 직책명 */
  value?: string;

  /** 선택 변경 핸들러 - 직책명과 코드를 함께 반환 */
  onChange: (positionName: string | null, positionCode?: string | null) => void;

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

  /** 크기 (기본값: small) */
  size?: 'small' | 'medium';

  /** 전체 너비 사용 여부 (기본값: true) */
  fullWidth?: boolean;
}
