/**
 * SubmittingAgencyComboBox 타입 정의
 */

export interface SubmittingAgencyComboBoxProps {
  /** 현재 선택된 제출기관 코드 */
  value?: string | null;

  /** 선택 값 변경 시 호출되는 콜백 */
  onChange: (value: string | null) => void;

  /** 플레이스홀더 텍스트 */
  placeholder?: string;

  /** 비활성화 여부 */
  disabled?: boolean;

  /** 에러 상태 */
  error?: boolean;

  /** 도움말 텍스트 */
  helperText?: string;

  /** 필수 입력 여부 */
  required?: boolean;

  /** CSS 클래스명 */
  className?: string;

  /** 라벨 텍스트 */
  label?: string;

  /** 컴포넌트 크기 */
  size?: 'small' | 'medium';

  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
}
