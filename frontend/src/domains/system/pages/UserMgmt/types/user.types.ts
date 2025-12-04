/**
 * 사용자관리 도메인 타입 정의
 *
 * @description DB 설계서 및 요구사항 정의서 기반 사용자 관리 타입 시스템
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// 기본 사용자 엔티티 (DB 테이블 기준)
export interface User {
  id: string;
  username: string;
  employeeNo: string;
  loginId?: string;

  // 개인 정보
  fullName: string;
  englishName?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;

  // 조직 정보
  deptId?: number;
  deptCode?: string;
  deptName?: string;
  positionId?: number;
  positionName?: string;
  jobRankCode?: string;
  employmentType?: string;
  hireDate?: string;

  // 계정 보안
  accountStatus: AccountStatus;
  passwordChangeRequired: boolean;
  passwordLastChangedAt?: string;
  lastLoginAt?: string;
  failedLoginCount: number;
  isLoginBlocked?: boolean;

  // 권한 레벨
  isAdmin: boolean;
  isExecutive: boolean;
  authLevel: number;

  // 할당된 역할 정보
  roles?: UserRole[];
  roleCount?: number;
  detailRoleCount?: number;

  // 시스템 정보
  timezone: string;
  language: string;
  isActive: boolean;

  // BaseEntity 필드
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
}

// 계정 상태 열거형
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'RESIGNED';

// 고용 형태 열거형
export type EmploymentType = 'REGULAR' | 'CONTRACT' | 'INTERN' | 'PART_TIME';

// 사용자 역할 관계
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  detailRoleCount: number;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

// 상세 역할 정보
export interface UserDetailRole {
  id: string;
  userRoleId: string;
  permissionCode: string;
  permissionName: string;
  description: string;
  roleDescriptionCode: string;
  isActive: boolean;
}

// 사용자 검색 필터
export interface UserFilters {
  [key: string]: string | undefined;
  deptCode?: string;         // 부서코드 (콤보박스)
  fullName?: string;         // 성명
}

// 사용자 폼 데이터 (등록/수정용)
export interface UserFormData {
  // 기본 정보
  employeeNo: string;
  fullName: string;
  englishName?: string;

  // 조직 정보
  deptId?: number;
  deptCode?: string;
  positionId?: number;
  jobRankCode?: string;
  employmentType: EmploymentType;

  // 계정 설정
  accountStatus: AccountStatus;
  loginBlocked: boolean;
  isActive: boolean;
  timezone: string;

  // 비밀번호 설정
  passwordChangeRequired: boolean;
  resetPassword?: boolean;

  // 역할 할당
  selectedRoles: string[];     // 선택된 역할 ID 목록
  selectedDetailRoles: string[]; // 선택된 상세역할 ID 목록
}

// 사용자 등록 요청
export interface CreateUserRequest {
  employeeNo: string;
  fullName: string;
  englishName?: string;
  deptId?: number;
  positionId?: number;
  jobRankCode?: string;
  employmentType: EmploymentType;
  accountStatus: AccountStatus;
  isActive: boolean;
  timezone: string;
  passwordChangeRequired: boolean;
  roleIds: string[];
  detailRoleIds: string[];
}

// 사용자 수정 요청
export interface UpdateUserRequest {
  fullName: string;
  englishName?: string;
  deptId?: number;
  positionId?: number;
  jobRankCode?: string;
  employmentType: EmploymentType;
  accountStatus: AccountStatus;
  isActive: boolean;
  timezone: string;
  passwordChangeRequired?: boolean;
  resetPassword?: boolean;
  roleIds: string[];
  detailRoleIds: string[];
}

// 사용자 모달 상태
export interface UserModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedUser: User | null;
}

// 사용자 페이지네이션
export interface UserPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 사용자 통계
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  adminUsers: number;
  recentLogins: number;
}

// 역할 선택을 위한 역할 옵션
export interface RoleOption {
  id: string;
  code: string;
  name: string;
  detailRoleCount: number;
  isSystemRole: boolean;
}

// 상세 역할 선택을 위한 옵션
export interface DetailRoleOption {
  id: string;
  roleId: string;
  code: string;
  name: string;
  description: string;
  roleDescriptionCode: string;
  isSystemRole: boolean;
}

// 부서 선택 옵션
export interface DepartmentOption {
  id: number;
  code: string;
  name: string;
  parentId?: number;
  level: number;
}

// 직책 선택 옵션
export interface PositionOption {
  id: number;
  name: string;
  code?: string;
  level?: number;
}

// UI 컴포넌트 props 타입
export interface UserMgmtProps {
  className?: string;
}

export interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  onClose: () => void;
  onSave: (formData: CreateUserRequest) => Promise<void>;
  onUpdate: (id: string, formData: UpdateUserRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  roles?: RoleOption[];
  detailRoles?: DetailRoleOption[];
  departments?: DepartmentOption[];
  positions?: PositionOption[];
}

// API 응답 타입
export interface UserApiResponse {
  success: boolean;
  data?: User;
  message?: string;
  errorCode?: string;
}

export interface UserListApiResponse {
  success: boolean;
  data?: {
    users: User[];
    pagination: UserPagination;
    statistics?: UserStatistics;
  };
  message?: string;
  errorCode?: string;
}