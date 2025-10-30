/**
 * 직원 관련 타입 정의
 * - employees 테이블 데이터 타입
 */

/**
 * 직원 기본 정보 (조회용)
 */
export interface Employee {
  empNo: string;                    // 직원번호 (PK)
  orgCode: string;                  // 소속조직코드
  orgName?: string;                 // 소속조직명 (JOIN)
  positionCode?: string;            // 직책코드
  positionName?: string;            // 직책명 (JOIN)
  empName: string;                  // 직원명
  empNameEn?: string;               // 영문명
  employeeNo?: string;              // 인사시스템 사원번호
  birthDate?: string;               // 생년월일
  gender?: 'M' | 'F' | 'O';         // 성별
  mobileNo?: string;                // 휴대전화
  email?: string;                   // 이메일
  officeTel?: string;               // 사무실 전화
  joinDate: string;                 // 입사일자
  resignDate?: string;              // 퇴사일자
  employmentStatus: 'ACTIVE' | 'RESIGNED' | 'LEAVE'; // 재직상태
  employmentType: 'REGULAR' | 'CONTRACT' | 'INTERN' | 'PART_TIME'; // 고용형태
  jobGrade?: string;                // 직급
  jobTitle?: string;                // 직함
  jobLevel?: number;                // 직급레벨
  workLocation?: string;            // 근무지
  workType?: 'OFFICE' | 'REMOTE' | 'HYBRID'; // 근무형태
  profileImageUrl?: string;         // 프로필 사진 URL
  isActive: string;                 // 활성화 여부 ('Y', 'N')
  createdBy: string;                // 생성자
  createdAt: string;                // 생성일시
  updatedBy: string;                // 수정자
  updatedAt: string;                // 수정일시
}

/**
 * 직원 검색 필터
 */
export interface EmployeeSearchFilter {
  empNo?: string;                   // 직원번호 (LIKE)
  empName?: string;                 // 직원명 (LIKE)
  orgCode?: string;                 // 소속조직코드 (EQUAL)
  positionCode?: string;            // 직책코드 (EQUAL)
  employmentStatus?: string;        // 재직상태 (EQUAL)
  employmentType?: string;          // 고용형태 (EQUAL)
  jobGrade?: string;                // 직급 (EQUAL)
  isActive?: string;                // 활성화 여부 (EQUAL)
}

/**
 * 직원 선택 콜백 타입
 */
export type EmployeeSelectCallback = (employee: Employee) => void;
