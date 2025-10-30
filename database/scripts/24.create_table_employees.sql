
-- =====================================================
-- 사원 테이블 (employees) 생성 및 users FK 추가
-- =====================================================
-- 설명: 조직 구성원(사원) 정보 관리
-- 작성자: Claude AI
-- 작성일: 2025-10-30
-- 참고:
--   - users 테이블과 1:1 관계 (emp_no)
--   - organizations 테이블과 N:1 관계 (org_code FK)
--   - positions 테이블과 N:1 관계 (position_code FK)
--   - 인사정보(입사일, 퇴사일, 재직상태 등) 포함
-- =====================================================

-- =====================================================
-- STEP 1: employees 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.employees CASCADE;

CREATE TABLE rsms.employees (
  -- 기본키
  emp_no VARCHAR(20) PRIMARY KEY,                       -- 사원번호 (PK)

  -- 외래키
  org_code VARCHAR(20) NOT NULL,                        -- 소속조직코드 (FK → organizations)
  position_code VARCHAR(20),                            -- 직책코드 (FK → positions)

  -- 기본 정보
  emp_name VARCHAR(100) NOT NULL,                       -- 사원명
  emp_name_en VARCHAR(100),                             -- 영문명
  employee_no VARCHAR(50),                              -- 인사시스템 사원번호 (별도 관리 시)

  -- 개인 정보
  birth_date DATE,                                      -- 생년월일
  gender VARCHAR(1),                                    -- 성별 ('M': 남성, 'F': 여성, 'O': 기타)
  mobile_no VARCHAR(20),                                -- 휴대전화번호
  email VARCHAR(100),                                   -- 이메일
  office_tel VARCHAR(20),                               -- 사무실 전화번호
  emergency_contact VARCHAR(20),                        -- 비상연락처
  emergency_contact_name VARCHAR(100),                  -- 비상연락처 이름

  -- 인사 정보
  join_date DATE NOT NULL,                              -- 입사일자
  resign_date DATE,                                     -- 퇴사일자
  employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 재직상태: ACTIVE(재직), RESIGNED(퇴사), LEAVE(휴직)
  employment_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR', -- 고용형태: REGULAR(정규직), CONTRACT(계약직), INTERN(인턴), PART_TIME(파트타임)

  -- 직급/직책 정보
  job_grade VARCHAR(20),                                -- 직급 (예: 사원, 대리, 과장, 차장, 부장)
  job_title VARCHAR(100),                               -- 직함/직책명
  job_level INTEGER,                                    -- 직급레벨 (1~10)

  -- 급여 정보
  salary_grade VARCHAR(20),                             -- 호봉
  annual_salary NUMERIC(15, 2),                         -- 연봉

  -- 근무 정보
  work_location VARCHAR(100),                           -- 근무지
  work_type VARCHAR(20) DEFAULT 'OFFICE',               -- 근무형태: OFFICE(사무실), REMOTE(재택), HYBRID(하이브리드)

  -- 추가 정보
  profile_image_url VARCHAR(500),                       -- 프로필 사진 URL
  signature_image_url VARCHAR(500),                     -- 서명 이미지 URL
  bio TEXT,                                             -- 간단 소개
  skills TEXT,                                          -- 보유 기술/스킬 (JSON 또는 CSV)
  certifications TEXT,                                  -- 자격증 목록

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',            -- 활성화 여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                     -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                     -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',           -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_employees_org_code FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_employees_gender CHECK (gender IN ('M', 'F', 'O')),
  CONSTRAINT chk_employees_employment_status CHECK (employment_status IN ('ACTIVE', 'RESIGNED', 'LEAVE')),
  CONSTRAINT chk_employees_employment_type CHECK (employment_type IN ('REGULAR', 'CONTRACT', 'INTERN', 'PART_TIME')),
  CONSTRAINT chk_employees_work_type CHECK (work_type IN ('OFFICE', 'REMOTE', 'HYBRID')),
  CONSTRAINT chk_employees_job_level CHECK (job_level BETWEEN 1 AND 10),
  CONSTRAINT chk_employees_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_employees_is_deleted CHECK (is_deleted IN ('Y', 'N')),
  CONSTRAINT chk_employees_join_resign_date CHECK (resign_date IS NULL OR resign_date >= join_date)
);

-- 인덱스 생성
CREATE INDEX idx_employees_org_code ON rsms.employees(org_code) WHERE is_deleted = 'N';
CREATE INDEX idx_employees_position_code ON rsms.employees(position_code) WHERE is_deleted = 'N';
CREATE INDEX idx_employees_emp_name ON rsms.employees(emp_name) WHERE is_deleted = 'N';
CREATE INDEX idx_employees_employment_status ON rsms.employees(employment_status) WHERE is_deleted = 'N';
CREATE INDEX idx_employees_join_date ON rsms.employees(join_date);
CREATE INDEX idx_employees_resign_date ON rsms.employees(resign_date);
CREATE INDEX idx_employees_is_active ON rsms.employees(is_active) WHERE is_deleted = 'N';

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_employees_org_status ON rsms.employees(org_code, employment_status)
  WHERE is_deleted = 'N';
CREATE INDEX idx_employees_active_employees ON rsms.employees(org_code, emp_name)
  WHERE is_deleted = 'N' AND is_active = 'Y' AND employment_status = 'ACTIVE';

-- 전문 검색 인덱스 (이름 검색 최적화)
CREATE INDEX idx_employees_name_search ON rsms.employees
  USING gin(to_tsvector('simple', emp_name));

-- 코멘트 추가
COMMENT ON TABLE rsms.employees IS '사원 정보 테이블 - 조직 구성원의 인사정보 관리';
COMMENT ON COLUMN rsms.employees.emp_no IS '사원번호 (PK)';
COMMENT ON COLUMN rsms.employees.org_code IS '소속조직코드 (FK → organizations)';
COMMENT ON COLUMN rsms.employees.position_code IS '직책코드 (FK → positions)';
COMMENT ON COLUMN rsms.employees.emp_name IS '사원명';
COMMENT ON COLUMN rsms.employees.emp_name_en IS '영문명';
COMMENT ON COLUMN rsms.employees.employee_no IS '인사시스템 사원번호 (외부 시스템 연동용)';
COMMENT ON COLUMN rsms.employees.birth_date IS '생년월일';
COMMENT ON COLUMN rsms.employees.gender IS '성별 (M: 남성, F: 여성, O: 기타)';
COMMENT ON COLUMN rsms.employees.mobile_no IS '휴대전화번호';
COMMENT ON COLUMN rsms.employees.email IS '이메일';
COMMENT ON COLUMN rsms.employees.office_tel IS '사무실 전화번호';
COMMENT ON COLUMN rsms.employees.emergency_contact IS '비상연락처';
COMMENT ON COLUMN rsms.employees.emergency_contact_name IS '비상연락처 이름';
COMMENT ON COLUMN rsms.employees.join_date IS '입사일자';
COMMENT ON COLUMN rsms.employees.resign_date IS '퇴사일자';
COMMENT ON COLUMN rsms.employees.employment_status IS '재직상태 (ACTIVE: 재직, RESIGNED: 퇴사, LEAVE: 휴직)';
COMMENT ON COLUMN rsms.employees.employment_type IS '고용형태 (REGULAR: 정규직, CONTRACT: 계약직, INTERN: 인턴, PART_TIME: 파트타임)';
COMMENT ON COLUMN rsms.employees.job_grade IS '직급 (예: 사원, 대리, 과장, 차장, 부장)';
COMMENT ON COLUMN rsms.employees.job_title IS '직함/직책명';
COMMENT ON COLUMN rsms.employees.job_level IS '직급레벨 (1~10, 높을수록 상위 직급)';
COMMENT ON COLUMN rsms.employees.salary_grade IS '호봉';
COMMENT ON COLUMN rsms.employees.annual_salary IS '연봉';
COMMENT ON COLUMN rsms.employees.work_location IS '근무지';
COMMENT ON COLUMN rsms.employees.work_type IS '근무형태 (OFFICE: 사무실, REMOTE: 재택, HYBRID: 하이브리드)';
COMMENT ON COLUMN rsms.employees.profile_image_url IS '프로필 사진 URL';
COMMENT ON COLUMN rsms.employees.signature_image_url IS '서명 이미지 URL';
COMMENT ON COLUMN rsms.employees.bio IS '간단 소개';
COMMENT ON COLUMN rsms.employees.skills IS '보유 기술/스킬 (JSON 또는 CSV)';
COMMENT ON COLUMN rsms.employees.certifications IS '자격증 목록';
COMMENT ON COLUMN rsms.employees.is_active IS '활성화 여부 (Y: 활성, N: 비활성)';
COMMENT ON COLUMN rsms.employees.created_by IS '생성자';
COMMENT ON COLUMN rsms.employees.created_at IS '생성일시';
COMMENT ON COLUMN rsms.employees.updated_by IS '수정자';
COMMENT ON COLUMN rsms.employees.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.employees.is_deleted IS '삭제여부 (Y: 삭제, N: 정상)';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_employees_updated_at
  BEFORE UPDATE ON rsms.employees
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();


-- =====================================================
-- STEP 2: 기존 users 데이터를 위한 employees 레코드 생성
-- =====================================================
-- 주의: 이 부분은 주석 처리되어 있습니다.
-- 이유:
--   1. 128.insert_initial_employees.sql에서 명시적으로 직원 데이터 INSERT
--   2. 'HEAD1010' 조직코드가 실제로 존재하지 않을 수 있음 (FK 에러 발생)
--   3. 자동 마이그레이션보다는 명시적인 데이터 관리가 더 안전함
--
-- 필요시 아래 주석을 해제하고 실제 존재하는 org_code로 변경 후 사용하세요.

/*
-- 기존 users 테이블에 있는 emp_no 확인 쿼리
SELECT user_id, username, emp_no, is_admin, is_executive, account_status
FROM rsms.users
WHERE is_deleted = 'N'
ORDER BY user_id;

-- 기존 users의 emp_no에 해당하는 employees 레코드 자동 생성
INSERT INTO rsms.employees (
  emp_no, org_code, position_code, emp_name, emp_name_en,
  birth_date, gender, mobile_no, email,
  join_date, employment_status, employment_type,
  job_grade, job_level, work_type,
  is_active, created_by, updated_by
)
SELECT
  u.emp_no,                           -- users의 emp_no 사용
  'HEAD1010',                         -- 기본 조직코드 (실제 조직으로 변경 필요)
  NULL,                               -- 직책코드 (나중에 업데이트)
  u.username,                         -- 사원명 (임시로 username 사용)
  NULL,                               -- 영문명
  NULL,                               -- 생년월일
  NULL,                               -- 성별
  NULL,                               -- 휴대전화
  NULL,                               -- 이메일
  CURRENT_DATE,                       -- 입사일자 (임시)
  'ACTIVE',                           -- 재직상태
  'REGULAR',                          -- 고용형태
  CASE
    WHEN u.is_admin = 'Y' THEN '시스템관리자'
    WHEN u.is_executive = 'Y' THEN '임원'
    ELSE '직원'
  END,                                -- 직급
  CASE
    WHEN u.is_admin = 'Y' THEN 10
    WHEN u.is_executive = 'Y' THEN 9
    ELSE u.auth_level
  END,                                -- 직급레벨
  'OFFICE',                           -- 근무형태
  'Y',                                -- 활성화
  'SYSTEM',                           -- 생성자
  'SYSTEM'                            -- 수정자
FROM rsms.users u
WHERE u.is_deleted = 'N'
  AND u.emp_no NOT IN (SELECT emp_no FROM rsms.employees)  -- 이미 존재하는 emp_no 제외
ON CONFLICT (emp_no) DO NOTHING;     -- 중복 방지
*/


-- =====================================================
-- STEP 3: users 테이블에 employees FK 제약조건 추가
-- =====================================================
--
-- 주의: FK 제약조건은 128.insert_initial_employees.sql에서 추가합니다
--       먼저 employees 테이블에 데이터를 INSERT한 후 FK를 추가해야 합니다
--
-- ALTER TABLE rsms.users
--   ADD CONSTRAINT fk_users_emp_no FOREIGN KEY (emp_no)
--     REFERENCES rsms.employees(emp_no)
--     ON DELETE RESTRICT
--     ON UPDATE CASCADE;

-- 코멘트 업데이트
COMMENT ON COLUMN rsms.users.emp_no IS '직원번호 (FK → employees.emp_no, 1:1 관계)';


-- =====================================================
-- STEP 4: 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- =====================================================
/*
INSERT INTO rsms.employees (
  emp_no, org_code, position_code, emp_name, emp_name_en,
  birth_date, gender, mobile_no, email,
  join_date, employment_status, employment_type,
  job_grade, job_level, work_type,
  is_active, created_by, updated_by
) VALUES
  -- 경영전략본부 사원들
  ('EMP001', 'HEAD1010', NULL, '홍길동', 'Hong Gil-dong',
   '1980-05-15', 'M', '010-1234-5678', 'hong@example.com',
   '2010-03-01', 'ACTIVE', 'REGULAR',
   '부장', 8, 'OFFICE',
   'Y', 'SYSTEM', 'SYSTEM'),

  ('EMP002', 'DEPT001', NULL, '김영희', 'Kim Young-hee',
   '1985-08-20', 'F', '010-2345-6789', 'kim@example.com',
   '2015-06-01', 'ACTIVE', 'REGULAR',
   '차장', 7, 'HYBRID',
   'Y', 'SYSTEM', 'SYSTEM'),

  ('EMP003', 'DEPT002', NULL, '박철수', 'Park Chul-soo',
   '1990-11-10', 'M', '010-3456-7890', 'park@example.com',
   '2020-01-15', 'ACTIVE', 'REGULAR',
   '과장', 6, 'OFFICE',
   'Y', 'SYSTEM', 'SYSTEM'),

  -- 리스크관리본부 사원들
  ('EMP004', 'HEAD1011', NULL, '이순신', 'Lee Soon-shin',
   '1975-03-25', 'M', '010-4567-8901', 'lee@example.com',
   '2005-09-01', 'ACTIVE', 'REGULAR',
   '본부장', 10, 'OFFICE',
   'Y', 'SYSTEM', 'SYSTEM'),

  ('EMP005', 'DEPT003', NULL, '정약용', 'Jung Yak-yong',
   '1988-07-08', 'M', '010-5678-9012', 'jung@example.com',
   '2018-04-01', 'ACTIVE', 'REGULAR',
   '차장', 7, 'OFFICE',
   'Y', 'SYSTEM', 'SYSTEM'),

  -- 디지털IT본부 사원들
  ('EMP006', 'HEAD1017', NULL, '세종대왕', 'Sejong The Great',
   '1982-12-30', 'M', '010-6789-0123', 'sejong@example.com',
   '2012-11-01', 'ACTIVE', 'REGULAR',
   '본부장', 10, 'REMOTE',
   'Y', 'SYSTEM', 'SYSTEM'),

  -- 퇴사자 예시
  ('EMP007', 'BRANCH005', NULL, '강감찬', 'Kang Gam-chan',
   '1978-02-14', 'M', '010-7890-1234', 'kang@example.com',
   '2008-01-01', 'RESIGNED', 'REGULAR',
   '부장', 8, 'OFFICE',
   'N', 'SYSTEM', 'SYSTEM');
*/

-- 스크립트 완료
