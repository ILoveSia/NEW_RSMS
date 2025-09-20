/**
 * 직책/책무이력 관련 TypeScript 타입 정의
 * PositionMgmt 표준 패턴을 기반으로 구현
 */

// 기본 엔티티 타입
export interface BaseEntity {
  id: string;
  registrationDate: string;
  registrar: string;
  modificationDate?: string;
  modifier?: string;
  isActive: boolean;
}

// 라디오 버튼 탭 타입
export type RoleHistoryTabType = 'responsibility' | 'position' | 'positionOnly';

// 탭 옵션 인터페이스
export interface RoleHistoryTab {
  key: RoleHistoryTabType;
  label: string;
  value: string;
}

// 검색 필터 인터페이스
export interface RoleHistoryFilters {
  tabType: RoleHistoryTabType;
  startDate: string;
  endDate: string;
  positionName: string;
  responsibilityName: string;
}

// 직책 정보 인터페이스
export interface Position {
  id: string;
  seq: number;
  positionCode: string;
  positionName: string;
  headquarters: string;
  job: string;
  isActive: boolean;
}

// 책무 정보 인터페이스
export interface Responsibility {
  id: string;
  responsibilityCode: string;
  responsibilityName: string;
  responsibilityDetailCode: string;
  responsibilityDetailContent: string;
  isActive: boolean;
}

// 직책/책무이력 메인 인터페이스
export interface RoleHistory extends BaseEntity {
  seq: number;
  boardResolutionDate: string;
  positionCode: string;
  positionName: string;
  responsibilityCode?: string;
  responsibilityName?: string;

  // 관계 데이터
  position?: Position;
  responsibility?: Responsibility;
}

// 책무 기준 이력 인터페이스
export interface ResponsibilityBasedHistory extends RoleHistory {
  // 책무 기준 특화 필드들
  responsibilityCode: string;
  responsibilityName: string;
}

// 직책 기준 이력 인터페이스
export interface PositionBasedHistory extends RoleHistory {
  // 직책 기준 특화 필드들
  positionCode: string;
  positionName: string;
  responsibilityCode?: string;
  responsibilityName?: string;
}

// 직책 전용 이력 인터페이스
export interface PositionOnlyHistory {
  id: string;
  positionCode: string;
  positionName: string;
  isActive: boolean;
}

// 페이지네이션 인터페이스
export interface RoleHistoryPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 통계 정보 인터페이스
export interface RoleHistoryStatistics {
  totalHistories: number;
  activePositions: number;
  totalResponsibilities: number;
  recentChanges: number;
}

// 모달 상태 인터페이스
export interface RoleHistoryModalState {
  positionModal: boolean;
  responsibilityModal: boolean;
  selectedPosition: Position | null;
  selectedResponsibility: Responsibility | null;
}

// 폼 데이터 인터페이스
export interface RoleHistoryFormData {
  tabType: RoleHistoryTabType;
  startDate: string;
  endDate: string;
  positionId?: string;
  responsibilityId?: string;
}

// API 응답 인터페이스
export interface RoleHistoryApiResponse<T = RoleHistory[]> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: RoleHistoryPagination;
  statistics?: RoleHistoryStatistics;
}

// 검색 매개변수 인터페이스
export interface RoleHistorySearchParams {
  tabType: RoleHistoryTabType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

// 에러 인터페이스
export interface RoleHistoryError {
  code: string;
  message: string;
  field?: string;
}

// 유효성 검사 결과 인터페이스
export interface RoleHistoryValidation {
  isValid: boolean;
  errors: RoleHistoryError[];
}

// 직책 선택 모달 Props
export interface PositionSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (position: Position) => void;
  loading?: boolean;
}

// 책무 선택 모달 Props
export interface ResponsibilitySelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (responsibility: Responsibility) => void;
  loading?: boolean;
}

// 데이터 그리드 Props
export interface RoleHistoryDataGridProps {
  tabType: RoleHistoryTabType;
  data: RoleHistory[] | PositionOnlyHistory[];
  loading?: boolean;
  onRowClick?: (item: RoleHistory | PositionOnlyHistory) => void;
  onRowDoubleClick?: (item: RoleHistory | PositionOnlyHistory) => void;
  onSelectionChange?: (selected: (RoleHistory | PositionOnlyHistory)[]) => void;
}

// 검색 필터 Props
export interface RoleHistorySearchFilterProps {
  filters: RoleHistoryFilters;
  onFiltersChange: (filters: Partial<RoleHistoryFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

// Hook 반환 타입
export interface UseRoleHistoryDataReturn {
  data: RoleHistory[] | PositionOnlyHistory[];
  loading: boolean;
  statistics: RoleHistoryStatistics;
  pagination: RoleHistoryPagination;
  error: RoleHistoryError | null;
  searchHistory: (params: RoleHistorySearchParams) => Promise<void>;
  exportToExcel: (data: (RoleHistory | PositionOnlyHistory)[]) => Promise<void>;
}

// 유틸리티 타입들
export type RoleHistoryKeys = keyof RoleHistory;
export type PositionKeys = keyof Position;
export type ResponsibilityKeys = keyof Responsibility;

// 상수 정의
export const ROLE_HISTORY_TABS: RoleHistoryTab[] = [
  { key: 'responsibility', label: '책무 기준', value: 'responsibility' },
  { key: 'position', label: '직책 기준', value: 'position' },
  { key: 'positionOnly', label: '직책', value: 'positionOnly' }
];

export const DEFAULT_ROLE_HISTORY_FILTERS: RoleHistoryFilters = {
  tabType: 'responsibility',
  startDate: '',
  endDate: '',
  positionName: '',
  responsibilityName: ''
};

export const DEFAULT_PAGINATION: RoleHistoryPagination = {
  page: 1,
  size: 20,
  total: 0,
  totalPages: 0
};

// 타입 가드 함수들
export const isRoleHistory = (item: any): item is RoleHistory => {
  return item && typeof item === 'object' && 'boardResolutionDate' in item;
};

export const isPositionOnlyHistory = (item: any): item is PositionOnlyHistory => {
  return item && typeof item === 'object' && 'positionCode' in item && !('boardResolutionDate' in item);
};

export const isResponsibilityBasedHistory = (item: any): item is ResponsibilityBasedHistory => {
  return isRoleHistory(item) && 'responsibilityCode' in item && Boolean(item.responsibilityCode);
};

export const isPositionBasedHistory = (item: any): item is PositionBasedHistory => {
  return isRoleHistory(item) && 'positionCode' in item;
};