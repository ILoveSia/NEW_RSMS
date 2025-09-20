/**
 * 이사회이력관리 타입 정의
 * @description 이사회 개최 이력 관리를 위한 타입 정의
 * @reference PositionMgmt 표준 타입 구조 적용
 */

// 기본 이사회 이력 인터페이스
export interface BoardHistory {
  id: string;
  seq: number;
  round: number; // 이사회 회차
  resolutionName: string; // 이사회 결의명
  resolutionDate: string; // 이사회 결의일자 (YYYY-MM-DD)
  uploadDate: string; // 업로드 일자 (YYYY-MM-DD)
  authorPosition: string; // 작성자 직책
  authorName: string; // 작성자
  summary?: string; // 요약정보
  content?: string; // 내용
  hasResponsibilityChart: boolean; // 책무구조도 생성 여부
  isActive: boolean; // 활성 상태
  createdAt: string; // 생성일시
  createdBy: string; // 생성자
  updatedAt?: string; // 수정일시
  updatedBy?: string; // 수정자
  fileCount?: number; // 첨부파일 개수
  responsibilityFileCount?: number; // 책무구조도 파일 개수
}

// 이사회 이력 검색 필터
export interface BoardHistoryFilters {
  resolutionName: string; // 이사회 결의명 검색
  resolutionDateFrom: string; // 이사회 결의일자 시작
  resolutionDateTo: string; // 이사회 결의일자 종료
  authorName: string; // 작성자 검색
  hasResponsibilityChart: string; // 책무구조도 생성여부 ('Y' | 'N' | '')
}

// 이사회 이력 폼 데이터
export interface BoardHistoryFormData {
  round: number; // 이사회 회차
  resolutionName: string; // 이사회 결의명
  resolutionDate: string; // 이사회 결의일자
  authorPosition: string; // 작성자 직책
  authorName: string; // 작성자
  summary?: string; // 요약정보
  content?: string; // 내용
  files: BoardHistoryFile[]; // 첨부파일 목록
}

// 첨부파일 인터페이스
export interface BoardHistoryFile {
  id: string;
  boardHistoryId: string; // 이사회 이력 ID
  seq: number; // 파일 순서
  fileName: string; // 파일명
  originalFileName: string; // 원본 파일명
  fileSize: number; // 파일 크기 (bytes)
  fileType: string; // 파일 타입 (MIME type)
  fileCategory: 'responsibility' | 'general'; // 파일 분류 (책무구조도/일반)
  filePath: string; // 파일 경로
  uploadDate: string; // 업로드 일자
  uploadBy: string; // 업로드한 사용자
  isActive: boolean; // 활성 상태
}

// 파일 업로드 폼 데이터
export interface FileUploadData {
  file: File;
  category: 'responsibility' | 'general';
  description?: string;
}

// 페이지네이션
export interface BoardHistoryPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태
export interface BoardHistoryModalState {
  addModal: boolean; // 등록 모달
  detailModal: boolean; // 상세 모달
  selectedBoardHistory: BoardHistory | null; // 선택된 이사회 이력
}

// API 응답 타입들
export interface BoardHistoryListResponse {
  data: BoardHistory[];
  pagination: BoardHistoryPagination;
  statistics: {
    totalCount: number;
    currentYearCount: number;
    totalFileCount: number;
    responsibilityFileCount: number;
  };
}

export interface BoardHistoryDetailResponse {
  boardHistory: BoardHistory;
  files: BoardHistoryFile[];
}

// 통계 정보
export interface BoardHistoryStatistics {
  totalCount: number; // 총 이력 수
  currentYearCount: number; // 금년 이력 수
  totalFileCount: number; // 총 첨부파일 수
  responsibilityFileCount: number; // 책무구조도 파일 수
  activeCount: number; // 활성 이력 수
  inactiveCount: number; // 비활성 이력 수
}

// 이사회 회차 옵션
export interface RoundOption {
  value: number;
  label: string;
}

// 작성자 직책 옵션
export interface AuthorPositionOption {
  value: string;
  label: string;
}

// 파일 분류 옵션
export interface FileCategoryOption {
  value: 'responsibility' | 'general';
  label: string;
  description: string;
}

// API 요청 타입들
export interface CreateBoardHistoryRequest {
  round: number;
  resolutionName: string;
  resolutionDate: string;
  authorPosition: string;
  authorName: string;
  summary?: string;
  content?: string;
}

export interface UpdateBoardHistoryRequest extends CreateBoardHistoryRequest {
  id: string;
}

export interface FileUploadRequest {
  boardHistoryId: string;
  files: FileUploadData[];
}

export interface BoardHistorySearchRequest {
  filters: Partial<BoardHistoryFilters>;
  pagination: {
    page: number;
    size: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 폼 검증 에러 타입
export interface BoardHistoryFormErrors {
  round?: string;
  resolutionName?: string;
  resolutionDate?: string;
  authorPosition?: string;
  authorName?: string;
  summary?: string;
  content?: string;
  files?: string;
}

// 비즈니스 규칙 상수
export const BOARD_HISTORY_CONSTANTS = {
  MAX_RESOLUTION_NAME_LENGTH: 200,
  MAX_SUMMARY_LENGTH: 1000,
  MAX_CONTENT_LENGTH: 4000,
  MAX_FILES_PER_HISTORY: 20,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  CURRENT_YEAR: new Date().getFullYear()
} as const;

// 유틸리티 타입들
export type BoardHistoryStatus = 'active' | 'inactive';
export type FileUploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';
export type SortField = 'seq' | 'resolutionName' | 'resolutionDate' | 'authorName' | 'uploadDate';
export type SortOrder = 'asc' | 'desc';

// 컴포넌트 Props 타입들
export interface BoardHistoryListProps {
  data: BoardHistory[];
  loading: boolean;
  onRowClick: (boardHistory: BoardHistory) => void;
  onRowDoubleClick: (boardHistory: BoardHistory) => void;
  onSelectionChange: (selected: BoardHistory[]) => void;
}

export interface BoardHistoryFormProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<BoardHistoryFormData>;
  onSubmit: (data: BoardHistoryFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface FileManagerProps {
  boardHistoryId: string;
  files: BoardHistoryFile[];
  onFileUpload: (files: FileUploadData[]) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (fileId: string) => void;
  readOnly?: boolean;
}