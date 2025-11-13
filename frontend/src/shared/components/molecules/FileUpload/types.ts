/**
 * 파일 업로드 컴포넌트 타입 정의
 * 첨부파일 테이블 구현 전: File 객체만 처리
 * 첨부파일 테이블 구현 후: 서버 파일 정보 추가 가능
 */

// 업로드된 파일 정보 (확장 가능한 구조)
export interface UploadedFile {
  // 필수: 클라이언트 파일 정보
  file: File;                     // File 객체
  id: string;                     // 임시 ID (클라이언트)

  // 선택: 서버 파일 정보 (나중에 추가)
  serverId?: string;              // 서버 파일 ID (attachments 테이블)
  url?: string;                   // 다운로드 URL
  uploadedAt?: string;            // 업로드 일시
  uploadedBy?: string;            // 업로더
}

// 파일 업로드 컴포넌트 Props
export interface FileUploadProps {
  // 기본 Props
  value?: UploadedFile[];         // 현재 파일 목록
  onChange?: (files: UploadedFile[]) => void;  // 파일 변경 콜백
  disabled?: boolean;             // 비활성화 여부
  readOnly?: boolean;             // 읽기 전용 (다운로드만 가능)

  // 제약 사항
  maxFiles?: number;              // 최대 파일 개수 (기본: 10)
  maxSize?: number;               // 최대 파일 크기 (bytes, 기본: 10MB)
  accept?: string;                // 허용 파일 타입 (예: '.pdf,.doc,.xlsx')

  // UI 커스터마이징
  label?: string;                 // 라벨
  placeholder?: string;           // 업로드 영역 텍스트
  showFileList?: boolean;         // 파일 목록 표시 여부 (기본: true)
  compact?: boolean;              // 컴팩트 모드

  // 에러 처리
  error?: string;                 // 에러 메시지
  onError?: (error: string) => void;  // 에러 콜백
}

// 파일 검증 결과
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
