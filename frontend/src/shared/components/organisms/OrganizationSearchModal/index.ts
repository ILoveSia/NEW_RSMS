/**
 * 조직(부점)조회팝업 모듈 내보내기
 * 여러 도메인에서 공통으로 사용하는 조직조회 팝업 컴포넌트
 */

// 메인 컴포넌트
export { default as OrganizationSearchModal } from './OrganizationSearchModal';

// 훅
export { useOrganizationSearch } from './hooks/useOrganizationSearch';

// 타입 정의
export type {
  Organization,
  OrganizationSearchFilters,
  OrganizationSearchResult,
  OrganizationSearchModalProps,
  OrganizationSelectionState,
  OrgTypeOption,
  OrganizationSearchApiResponse,
  UseOrganizationSearchReturn,
  OrganizationPagination
} from './types/organizationSearch.types';
