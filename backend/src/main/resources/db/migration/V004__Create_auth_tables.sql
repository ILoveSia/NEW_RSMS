-- =====================================================================================
-- V004: 인증 및 권한 테이블 생성
-- =====================================================================================
-- 설명:
--   - users: 사용자 테이블
--   - roles: 역할 테이블
--   - menu_items: 메뉴 테이블
--   - permissions: 권한 테이블
--   - role_permissions: 역할-권한 매핑 테이블
--   - user_roles: 사용자-역할 매핑 테이블
--   - menu_permissions: 메뉴-권한 매핑 테이블
--   - login_history: 로그인 이력 테이블
--   - access_logs: 접근 로그 테이블
--   - Spring Session 테이블 (세션 관리)
-- 작성일: 2025-10-28
-- Flyway 마이그레이션: V004
-- 참조: database/scripts/14~23
-- =====================================================================================



-- =====================================================
-- 사용자 테이블 (users)
-- =====================================================
-- 설명: 시스템 사용자 계정 정보 (Spring Security + employees 연동)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - employees 테이블과 1:1 관계 (emp_no FK)
--   - Spring Security 인증에 사용
--   - BCrypt 해시 (강도 12) 사용
--   - 로그인 차단, 계정 잠금 등 보안 기능 포함
-- =====================================================

-- DROP TABLE IF EXISTS rsms.users CASCADE;

CREATE TABLE rsms.users (
  -- 기본키
  user_id BIGSERIAL PRIMARY KEY,                       -- 사용자ID (PK, 자동증가)

  -- 기본 정보
  username VARCHAR(50) NOT NULL UNIQUE,                -- 사용자 아이디 (로그인 ID)
  password_hash VARCHAR(255) NOT NULL,                 -- BCrypt 해시 (강도 12)
  emp_no VARCHAR(20) NOT NULL UNIQUE,                  -- 직원번호 (employees FK)

  -- 계정 보안
  account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 계정상태: ACTIVE, LOCKED, SUSPENDED, RESIGNED
  password_change_required VARCHAR(1) NOT NULL DEFAULT 'Y', -- 비밀번호 변경 필요 여부 ('Y', 'N')
  password_last_changed_at TIMESTAMP,                  -- 비밀번호 마지막 변경일시
  last_login_at TIMESTAMP,                             -- 마지막 로그인 일시
  failed_login_count INTEGER NOT NULL DEFAULT 0,       -- 연속 로그인 실패 횟수
  locked_until TIMESTAMP,                              -- 계정 잠금 해제 일시

  -- 권한 레벨
  is_admin VARCHAR(1) NOT NULL DEFAULT 'N',            -- 관리자 여부 ('Y', 'N')
  is_executive VARCHAR(1) NOT NULL DEFAULT 'N',        -- 임원 여부 ('Y', 'N')
  auth_level INTEGER NOT NULL DEFAULT 1,               -- 권한 레벨 (1~10)

  -- 로그인 차단 및 활성화
  is_login_blocked VARCHAR(1) NOT NULL DEFAULT 'N',    -- 로그인 차단 여부 ('Y', 'N')

  -- 시스템 정보
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul',  -- 타임존
  language VARCHAR(10) NOT NULL DEFAULT 'ko',          -- 언어 (ko, en)
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 활성화 여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 체크 제약조건
  CONSTRAINT chk_users_account_status CHECK (account_status IN ('ACTIVE', 'LOCKED', 'SUSPENDED', 'RESIGNED')),
  CONSTRAINT chk_users_auth_level CHECK (auth_level BETWEEN 1 AND 10),
  CONSTRAINT chk_users_failed_login_count CHECK (failed_login_count >= 0),
  CONSTRAINT chk_users_password_change_required CHECK (password_change_required IN ('Y', 'N')),
  CONSTRAINT chk_users_is_admin CHECK (is_admin IN ('Y', 'N')),
  CONSTRAINT chk_users_is_executive CHECK (is_executive IN ('Y', 'N')),
  CONSTRAINT chk_users_is_login_blocked CHECK (is_login_blocked IN ('Y', 'N')),
  CONSTRAINT chk_users_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_users_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_users_username ON rsms.users(username) WHERE is_deleted = 'N';
CREATE INDEX idx_users_emp_no ON rsms.users(emp_no) WHERE is_deleted = 'N';
CREATE INDEX idx_users_account_status ON rsms.users(account_status) WHERE is_deleted = 'N';
CREATE INDEX idx_users_last_login_at ON rsms.users(last_login_at DESC);
CREATE INDEX idx_users_is_active ON rsms.users(is_active) WHERE is_deleted = 'N';

-- 복합 인덱스 (로그인 조회 최적화)
CREATE INDEX idx_users_login ON rsms.users(username, password_hash, account_status)
  WHERE is_deleted = 'N' AND is_active = 'Y';

-- 부분 인덱스 (활성 사용자만)
CREATE INDEX idx_users_active ON rsms.users(user_id)
  WHERE is_deleted = 'N' AND is_active = 'Y' AND account_status = 'ACTIVE';

-- 코멘트 추가
COMMENT ON TABLE rsms.users IS '사용자 계정 정보 (Spring Security + employees 연동)';
COMMENT ON COLUMN rsms.users.user_id IS '사용자ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.users.username IS '사용자 아이디 (로그인 ID)';
COMMENT ON COLUMN rsms.users.password_hash IS 'BCrypt 해시 (강도 12) - Spring Security 표준';
COMMENT ON COLUMN rsms.users.emp_no IS '직원번호 (employees FK)';
COMMENT ON COLUMN rsms.users.account_status IS '계정상태: ACTIVE(재직), LOCKED(잠김), SUSPENDED(정지), RESIGNED(퇴직)';
COMMENT ON COLUMN rsms.users.password_change_required IS '비밀번호 변경 필요 여부';
COMMENT ON COLUMN rsms.users.password_last_changed_at IS '비밀번호 마지막 변경일시';
COMMENT ON COLUMN rsms.users.last_login_at IS '마지막 로그인 일시';
COMMENT ON COLUMN rsms.users.failed_login_count IS '연속 로그인 실패 횟수 (5회 이상 시 계정 잠금)';
COMMENT ON COLUMN rsms.users.locked_until IS '계정 잠금 해제 일시 (NULL이면 잠금 아님)';
COMMENT ON COLUMN rsms.users.is_admin IS '관리자 여부';
COMMENT ON COLUMN rsms.users.is_executive IS '임원 여부';
COMMENT ON COLUMN rsms.users.auth_level IS '권한 레벨 (1~10, 높을수록 강력)';
COMMENT ON COLUMN rsms.users.is_login_blocked IS 'UserMgmt UI의 "로그인차단" 체크박스';
COMMENT ON COLUMN rsms.users.timezone IS '타임존 (기본값: Asia/Seoul)';
COMMENT ON COLUMN rsms.users.language IS '언어 (ko, en)';
COMMENT ON COLUMN rsms.users.is_active IS 'UserMgmt UI의 "활성화" 체크박스';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON rsms.users
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 역할 테이블 (roles)
-- =====================================================
-- 설명: 사용자에게 할당되는 역할 (RoleMgmt UI 왼쪽 그리드)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - RoleMgmt UI 왼쪽 그리드 데이터
--   - 역할(Role) → 상세역할(Permission) 2단계 구조의 상위 계층
--   - 시스템 기본 역할: Administrator, Manager, User, Any
--   - 계층 구조 지원 (parent_role_id)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.roles CASCADE;

CREATE TABLE rsms.roles (
  -- 기본키
  role_id BIGSERIAL PRIMARY KEY,                       -- 역할ID (PK, 자동증가)

  -- 기본 정보
  role_code VARCHAR(50) NOT NULL UNIQUE,               -- 역할 코드 (예: Administrator, Manager, User, Any)
  role_name VARCHAR(100) NOT NULL,                     -- 역할명 (예: 최고관리자, 관리자, 사용자, 비로그인)
  description TEXT,                                    -- 역할 설명

  -- 역할 분류
  role_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM',     -- 역할 타입: SYSTEM, CUSTOM
  role_category VARCHAR(20),                           -- 역할 카테고리: 최고관리자, 관리자, 사용자

  -- 계층 구조
  parent_role_id BIGINT,                               -- 상위 역할 ID (self-reference)
  sort_order INTEGER NOT NULL DEFAULT 0,               -- 정렬 순서

  -- 상태 관리
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',        -- 상태: ACTIVE, INACTIVE, ARCHIVED
  is_system_role VARCHAR(1) NOT NULL DEFAULT 'N',      -- 시스템 역할 여부 (삭제 불가) ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_roles_parent
    FOREIGN KEY (parent_role_id)
    REFERENCES rsms.roles(role_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_roles_role_type CHECK (role_type IN ('SYSTEM', 'CUSTOM')),
  CONSTRAINT chk_roles_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  CONSTRAINT chk_roles_role_category CHECK (role_category IN ('최고관리자', '관리자', '사용자')),
  CONSTRAINT chk_roles_is_system_role CHECK (is_system_role IN ('Y', 'N')),
  CONSTRAINT chk_roles_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_roles_role_code ON rsms.roles(role_code) WHERE is_deleted = 'N';
CREATE INDEX idx_roles_role_name ON rsms.roles(role_name) WHERE is_deleted = 'N';
CREATE INDEX idx_roles_parent_role_id ON rsms.roles(parent_role_id) WHERE is_deleted = 'N';
CREATE INDEX idx_roles_status ON rsms.roles(status) WHERE is_deleted = 'N';
CREATE INDEX idx_roles_is_system_role ON rsms.roles(is_system_role) WHERE is_deleted = 'N';
CREATE INDEX idx_roles_sort_order ON rsms.roles(sort_order);

-- 부분 인덱스 (시스템 역할만)
CREATE INDEX idx_roles_system ON rsms.roles(role_id)
  WHERE is_deleted = 'N' AND is_system_role = 'Y';

-- 코멘트 추가
COMMENT ON TABLE rsms.roles IS '역할 정의 (RoleMgmt UI 왼쪽 그리드)';
COMMENT ON COLUMN rsms.roles.role_id IS '역할ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.roles.role_code IS '역할 코드 (예: Administrator, Manager, User, Any)';
COMMENT ON COLUMN rsms.roles.role_name IS '역할명 (예: 최고관리자, 관리자, 사용자, 비로그인)';
COMMENT ON COLUMN rsms.roles.description IS '역할 설명';
COMMENT ON COLUMN rsms.roles.role_type IS 'SYSTEM: 시스템 기본 역할, CUSTOM: 사용자 정의 역할';
COMMENT ON COLUMN rsms.roles.role_category IS '역할 카테고리: 최고관리자, 관리자, 사용자';
COMMENT ON COLUMN rsms.roles.parent_role_id IS '상위 역할 ID (계층 구조)';
COMMENT ON COLUMN rsms.roles.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.roles.status IS '상태: ACTIVE(활성), INACTIVE(비활성), ARCHIVED(보관)';
COMMENT ON COLUMN rsms.roles.is_system_role IS 'TRUE면 삭제 불가능한 시스템 역할';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_roles_updated_at
  BEFORE UPDATE ON rsms.roles
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 메뉴 테이블 (menu_items)
-- =====================================================
-- 설명: 시스템 메뉴 계층 구조 (MenuMgmt UI 트리)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - MenuMgmt UI 왼쪽 트리 구조 데이터
--   - Self-reference로 계층 구조 구현
--   - 메뉴 타입: folder(폴더), page(페이지), link(외부 링크)
--   - 메뉴 깊이: 1(대메뉴), 2(중메뉴), 3(소메뉴)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.menu_items CASCADE;

CREATE TABLE rsms.menu_items (
  -- 기본키
  menu_id BIGSERIAL PRIMARY KEY,                       -- 메뉴ID (PK, 자동증가)

  -- 메뉴 기본 정보
  menu_code VARCHAR(20) NOT NULL UNIQUE,               -- 메뉴 코드 (예: 01, 0101, 0802)
  menu_name VARCHAR(100) NOT NULL,                     -- 메뉴명
  description TEXT,                                    -- 메뉴 설명

  -- URL 및 라우팅
  url VARCHAR(255),                                    -- 메뉴 URL (예: /app/dashboard)
  parameters TEXT,                                     -- URL 파라미터

  -- 계층 구조
  parent_id BIGINT,                                    -- 상위 메뉴 ID (self-reference)
  depth INTEGER NOT NULL DEFAULT 1,                    -- 메뉴 깊이 (1, 2, 3)
  sort_order INTEGER NOT NULL DEFAULT 0,               -- 정렬 순서

  -- 메뉴 속성
  system_code VARCHAR(50) NOT NULL,                    -- 시스템 코드 (예: DASHBOARD_MAIN)
  menu_type VARCHAR(20) NOT NULL DEFAULT 'page',       -- 메뉴 타입: folder, page, link
  icon VARCHAR(50),                                    -- 아이콘 이름 (Material-UI)

  -- 메뉴 설정
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 활성화 여부 ('Y', 'N')
  is_test_page VARCHAR(1) NOT NULL DEFAULT 'N',        -- 테스트 페이지 여부 ('Y', 'N')
  requires_auth VARCHAR(1) NOT NULL DEFAULT 'Y',       -- 인증 필요 여부 ('Y', 'N')
  open_in_new_window VARCHAR(1) NOT NULL DEFAULT 'N',  -- 새 창 열기 여부 ('Y', 'N')
  dashboard_layout VARCHAR(1) NOT NULL DEFAULT 'N',    -- 대시보드 레이아웃 사용 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_menu_items_parent
    FOREIGN KEY (parent_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_menu_items_menu_type CHECK (menu_type IN ('folder', 'page', 'link')),
  CONSTRAINT chk_menu_items_depth CHECK (depth BETWEEN 1 AND 3),
  CONSTRAINT chk_menu_items_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_is_test_page CHECK (is_test_page IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_requires_auth CHECK (requires_auth IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_open_in_new_window CHECK (open_in_new_window IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_dashboard_layout CHECK (dashboard_layout IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_menu_items_menu_code ON rsms.menu_items(menu_code) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_parent_id ON rsms.menu_items(parent_id) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_system_code ON rsms.menu_items(system_code) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_depth ON rsms.menu_items(depth) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_is_active ON rsms.menu_items(is_active) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_requires_auth ON rsms.menu_items(requires_auth) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_sort_order ON rsms.menu_items(sort_order);

-- 복합 인덱스 (메뉴 트리 조회 최적화)
CREATE INDEX idx_menu_items_tree ON rsms.menu_items(parent_id, sort_order)
  WHERE is_deleted = 'N' AND is_active = 'Y';

-- 부분 인덱스 (활성 메뉴만)
CREATE INDEX idx_menu_items_active ON rsms.menu_items(menu_id)
  WHERE is_deleted = 'N' AND is_active = 'Y';

-- 전문 검색 인덱스 (한글 지원 - pg_trgm 확장 사용)
-- 설치 필요: CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_menu_items_fulltext ON rsms.menu_items
--   USING gin(menu_name gin_trgm_ops)
--   WHERE is_deleted = 'N';

-- 기본 텍스트 검색 인덱스 (simple 설정 사용)
CREATE INDEX idx_menu_items_search ON rsms.menu_items
  USING gin(to_tsvector('simple', menu_name || ' ' || COALESCE(description, '')))
  WHERE is_deleted = 'N';

-- 코멘트 추가
COMMENT ON TABLE rsms.menu_items IS '시스템 메뉴 계층 구조 (MenuMgmt UI 트리)';
COMMENT ON COLUMN rsms.menu_items.menu_id IS '메뉴ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.menu_items.menu_code IS '메뉴 코드: 01(1depth), 0101(2depth), 0802(3depth)';
COMMENT ON COLUMN rsms.menu_items.menu_name IS '메뉴명';
COMMENT ON COLUMN rsms.menu_items.description IS '메뉴 설명';
COMMENT ON COLUMN rsms.menu_items.url IS '메뉴 URL (예: /app/dashboard)';
COMMENT ON COLUMN rsms.menu_items.parameters IS 'URL 파라미터';
COMMENT ON COLUMN rsms.menu_items.parent_id IS '상위 메뉴 ID (NULL이면 최상위)';
COMMENT ON COLUMN rsms.menu_items.depth IS '메뉴 깊이 (1: 대메뉴, 2: 중메뉴, 3: 소메뉴)';
COMMENT ON COLUMN rsms.menu_items.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.menu_items.system_code IS '시스템 코드 (예: DASHBOARD_MAIN, USER_MGMT)';
COMMENT ON COLUMN rsms.menu_items.menu_type IS 'folder: 폴더, page: 페이지, link: 외부 링크';
COMMENT ON COLUMN rsms.menu_items.icon IS '아이콘 이름 (Material-UI)';
COMMENT ON COLUMN rsms.menu_items.is_active IS '활성화 여부';
COMMENT ON COLUMN rsms.menu_items.is_test_page IS '테스트 페이지 여부';
COMMENT ON COLUMN rsms.menu_items.requires_auth IS 'TRUE면 로그인 필요, FALSE면 익명 접근 가능';
COMMENT ON COLUMN rsms.menu_items.open_in_new_window IS '새 창 열기 여부';
COMMENT ON COLUMN rsms.menu_items.dashboard_layout IS '대시보드 레이아웃 사용 여부';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON rsms.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 상세역할/권한 테이블 (permissions)
-- =====================================================
-- 설명: 메뉴별 세밀한 권한 정의 (RoleMgmt UI 오른쪽 그리드 - 상세역할)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - RoleMgmt UI 오른쪽 그리드 데이터
--   - 역할(Role) → 상세역할(Permission) 2단계 구조의 하위 계층
--   - 메뉴별로 CRUD 권한 + 확장 권한 정의
--   - 역활유형, 본점기본, 영업점기본, 사용여부 지원
-- =====================================================

-- DROP TABLE IF EXISTS rsms.permissions CASCADE;

CREATE TABLE rsms.permissions (
  -- 기본키
  permission_id BIGSERIAL PRIMARY KEY,                 -- 권한ID (PK, 자동증가)

  -- 기본 정보
  permission_code VARCHAR(50) NOT NULL UNIQUE,         -- 권한 코드 (예: A01, A99, U01)
  permission_name VARCHAR(100) NOT NULL,               -- 권한명 (예: 운영관리자, 시스템관리자)
  description TEXT,                                    -- 권한 설명

  -- 메뉴 연결
  menu_id BIGINT NOT NULL,                             -- 메뉴 ID (menu_items FK)

  -- 권한 유형 (RoleMgmt UI 오른쪽 그리드 컬럼)
  business_permission VARCHAR(1) NOT NULL DEFAULT 'N', -- 역활유형 (Y: 업무, N: 일반)
  main_business_permission VARCHAR(1) NOT NULL DEFAULT 'N', -- 본점기본 ('Y', 'N')
  execution_permission VARCHAR(1) NOT NULL DEFAULT 'N',-- 영업점기본 ('Y', 'N')

  -- CRUD 권한
  can_view VARCHAR(1) NOT NULL DEFAULT 'N',            -- 조회 권한 ('Y', 'N')
  can_create VARCHAR(1) NOT NULL DEFAULT 'N',          -- 생성 권한 ('Y', 'N')
  can_update VARCHAR(1) NOT NULL DEFAULT 'N',          -- 수정 권한 ('Y', 'N')
  can_delete VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제 권한 ('Y', 'N')
  can_select VARCHAR(1) NOT NULL DEFAULT 'N',          -- 선택 권한 ('Y', 'N')

  -- 확장 권한
  extended_permission_type VARCHAR(50),                -- 확장 권한 유형 (전체권한, 제한권한, 조회권한)
  extended_permission_name VARCHAR(100),               -- 확장 권한명

  -- 정렬 및 상태
  sort_order INTEGER NOT NULL DEFAULT 0,               -- 정렬 순서
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_permissions_menu_id
    FOREIGN KEY (menu_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_permissions_business_permission CHECK (business_permission IN ('Y', 'N')),
  CONSTRAINT chk_permissions_main_business_permission CHECK (main_business_permission IN ('Y', 'N')),
  CONSTRAINT chk_permissions_execution_permission CHECK (execution_permission IN ('Y', 'N')),
  CONSTRAINT chk_permissions_can_view CHECK (can_view IN ('Y', 'N')),
  CONSTRAINT chk_permissions_can_create CHECK (can_create IN ('Y', 'N')),
  CONSTRAINT chk_permissions_can_update CHECK (can_update IN ('Y', 'N')),
  CONSTRAINT chk_permissions_can_delete CHECK (can_delete IN ('Y', 'N')),
  CONSTRAINT chk_permissions_can_select CHECK (can_select IN ('Y', 'N')),
  CONSTRAINT chk_permissions_extended_permission_type CHECK (
    extended_permission_type IN ('전체권한', '제한권한', '조회권한')
  ),
  CONSTRAINT chk_permissions_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_permissions_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_permissions_code ON rsms.permissions(permission_code) WHERE is_deleted = 'N';
CREATE INDEX idx_permissions_menu_id ON rsms.permissions(menu_id) WHERE is_deleted = 'N';
CREATE INDEX idx_permissions_is_active ON rsms.permissions(is_active) WHERE is_deleted = 'N';
CREATE INDEX idx_permissions_sort_order ON rsms.permissions(sort_order);

-- 코멘트 추가
COMMENT ON TABLE rsms.permissions IS '상세역할/권한 정의 (RoleMgmt UI 오른쪽 그리드)';
COMMENT ON COLUMN rsms.permissions.permission_id IS '권한ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.permissions.permission_code IS '권한 코드 (예: A01, A99, U01, U80)';
COMMENT ON COLUMN rsms.permissions.permission_name IS '권한명 (예: 운영관리자, 시스템관리자)';
COMMENT ON COLUMN rsms.permissions.description IS '권한 설명';
COMMENT ON COLUMN rsms.permissions.menu_id IS '메뉴 ID (어떤 메뉴에 대한 권한인지)';
COMMENT ON COLUMN rsms.permissions.business_permission IS 'RoleMgmt UI "역활유형" 컬럼 (Y: 업무, N: 일반)';
COMMENT ON COLUMN rsms.permissions.main_business_permission IS 'RoleMgmt UI "본점기본" 체크박스';
COMMENT ON COLUMN rsms.permissions.execution_permission IS 'RoleMgmt UI "영업점기본" 체크박스';
COMMENT ON COLUMN rsms.permissions.can_view IS '조회 권한';
COMMENT ON COLUMN rsms.permissions.can_create IS '생성 권한';
COMMENT ON COLUMN rsms.permissions.can_update IS '수정 권한';
COMMENT ON COLUMN rsms.permissions.can_delete IS '삭제 권한';
COMMENT ON COLUMN rsms.permissions.can_select IS '선택 권한';
COMMENT ON COLUMN rsms.permissions.extended_permission_type IS '확장 권한 유형 (전체권한, 제한권한, 조회권한)';
COMMENT ON COLUMN rsms.permissions.extended_permission_name IS '확장 권한명';
COMMENT ON COLUMN rsms.permissions.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.permissions.is_active IS 'RoleMgmt UI "사용여부" 체크박스';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_permissions_updated_at
  BEFORE UPDATE ON rsms.permissions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 역할-권한 매핑 테이블 (role_permissions)
-- =====================================================
-- 설명: 역할에 상세역할(권한)을 할당하는 매핑 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - 역할(Role)과 권한(Permission)의 N:M 관계
--   - 역할에 여러 권한을 할당 가능
--   - 권한 부여/제거 이력 추적
-- =====================================================

-- DROP TABLE IF EXISTS rsms.role_permissions CASCADE;

CREATE TABLE rsms.role_permissions (
  -- 기본키
  role_permission_id BIGSERIAL PRIMARY KEY,            -- 역할권한ID (PK, 자동증가)

  -- 외래키
  role_id BIGINT NOT NULL,                             -- 역할 ID (roles FK)
  permission_id BIGINT NOT NULL,                       -- 권한 ID (permissions FK)

  -- 할당 정보
  granted VARCHAR(1) NOT NULL DEFAULT 'Y',             -- 권한 부여 여부 ('Y', 'N')
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 할당 일시
  assigned_by VARCHAR(100),                            -- 할당자

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id)
    REFERENCES rsms.roles(role_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id)
    REFERENCES rsms.permissions(permission_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (역할-권한 조합은 유일)
  CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id),

  -- 체크 제약조건
  CONSTRAINT chk_role_permissions_granted CHECK (granted IN ('Y', 'N')),
  CONSTRAINT chk_role_permissions_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_role_permissions_role_id ON rsms.role_permissions(role_id) WHERE is_deleted = 'N';
CREATE INDEX idx_role_permissions_permission_id ON rsms.role_permissions(permission_id) WHERE is_deleted = 'N';
CREATE INDEX idx_role_permissions_granted ON rsms.role_permissions(granted) WHERE is_deleted = 'N';

-- 복합 인덱스 (역할-권한 조회 최적화)
CREATE INDEX idx_role_permissions_lookup ON rsms.role_permissions(role_id, permission_id, granted)
  WHERE is_deleted = 'N';

-- 코멘트 추가
COMMENT ON TABLE rsms.role_permissions IS '역할-권한 매핑 (역할에 상세역할 할당)';
COMMENT ON COLUMN rsms.role_permissions.role_permission_id IS '역할권한ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.role_permissions.role_id IS '역할 ID (roles FK)';
COMMENT ON COLUMN rsms.role_permissions.permission_id IS '권한 ID (permissions FK)';
COMMENT ON COLUMN rsms.role_permissions.granted IS 'Y: 권한 부여, N: 권한 제거';
COMMENT ON COLUMN rsms.role_permissions.assigned_at IS '할당 일시';
COMMENT ON COLUMN rsms.role_permissions.assigned_by IS '할당자';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_role_permissions_updated_at
  BEFORE UPDATE ON rsms.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 사용자-역할 매핑 테이블 (user_roles)
-- =====================================================
-- 설명: 사용자에게 역할을 할당하는 매핑 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - 사용자(User)와 역할(Role)의 N:M 관계
--   - 한 사용자는 여러 역할을 가질 수 있음
--   - UserMgmt UI의 "역할" 컬럼과 매핑
-- =====================================================

-- DROP TABLE IF EXISTS rsms.user_roles CASCADE;

CREATE TABLE rsms.user_roles (
  -- 기본키
  user_role_id BIGSERIAL PRIMARY KEY,              -- 사용자역할ID (PK, 자동증가)

  -- 외래키
  user_id BIGINT NOT NULL,                         -- 사용자 ID (users FK)
  role_id BIGINT NOT NULL,                         -- 역할 ID (roles FK)

  -- 할당 정보
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 할당 일시
  assigned_by VARCHAR(100),                        -- 할당자
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',       -- 활성 여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id)
    REFERENCES rsms.users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id)
    REFERENCES rsms.roles(role_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (사용자-역할 조합은 유일)
  CONSTRAINT uk_user_role UNIQUE (user_id, role_id),

  -- 체크 제약조건
  CONSTRAINT chk_user_roles_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_user_roles_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_user_roles_user_id ON rsms.user_roles(user_id) WHERE is_deleted = 'N';
CREATE INDEX idx_user_roles_role_id ON rsms.user_roles(role_id) WHERE is_deleted = 'N';
CREATE INDEX idx_user_roles_is_active ON rsms.user_roles(is_active) WHERE is_deleted = 'N';

-- 복합 인덱스 (사용자별 활성 역할 조회 최적화)
CREATE INDEX idx_user_roles_lookup ON rsms.user_roles(user_id, is_active)
  WHERE is_deleted = 'N';

-- 코멘트 추가
COMMENT ON TABLE rsms.user_roles IS '사용자-역할 매핑 (사용자에게 역할 할당)';
COMMENT ON COLUMN rsms.user_roles.user_role_id IS '사용자역할ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.user_roles.user_id IS '사용자 ID (users FK)';
COMMENT ON COLUMN rsms.user_roles.role_id IS '역할 ID (roles FK)';
COMMENT ON COLUMN rsms.user_roles.assigned_at IS '할당 일시';
COMMENT ON COLUMN rsms.user_roles.assigned_by IS '할당자';
COMMENT ON COLUMN rsms.user_roles.is_active IS 'Y: 활성, N: 비활성';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_user_roles_updated_at
  BEFORE UPDATE ON rsms.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 메뉴-역할 권한 매핑 테이블 (menu_permissions)
-- =====================================================
-- 설명: 역할별 메뉴 접근 권한 및 CRUD 권한을 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - MenuMgmt UI의 오른쪽 그리드와 매핑
--   - 역할(Role)과 메뉴(MenuItem)의 N:M 관계
--   - CRUD 권한: 조회, 등록, 수정, 삭제, 선택
-- =====================================================

-- DROP TABLE IF EXISTS rsms.menu_permissions CASCADE;

CREATE TABLE rsms.menu_permissions (
  -- 기본키
  menu_permission_id BIGSERIAL PRIMARY KEY,        -- 메뉴권한ID (PK, 자동증가)

  -- 외래키
  role_id BIGINT NOT NULL,                         -- 역할 ID (roles FK)
  menu_id BIGINT NOT NULL,                         -- 메뉴 ID (menu_items FK)

  -- CRUD 권한 (MenuMgmt UI 오른쪽 그리드 컬럼들)
  can_view VARCHAR(1) NOT NULL DEFAULT 'N',        -- 조회 권한 ('Y', 'N')
  can_create VARCHAR(1) NOT NULL DEFAULT 'N',      -- 등록 권한 ('Y', 'N')
  can_update VARCHAR(1) NOT NULL DEFAULT 'N',      -- 수정 권한 ('Y', 'N')
  can_delete VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제 권한 ('Y', 'N')
  can_select VARCHAR(1) NOT NULL DEFAULT 'N',      -- 선택 권한 ('Y', 'N')

  -- 할당 정보
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 할당 일시
  assigned_by VARCHAR(100),                        -- 할당자

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_menu_permissions_role
    FOREIGN KEY (role_id)
    REFERENCES rsms.roles(role_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_menu_permissions_menu
    FOREIGN KEY (menu_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (역할-메뉴 조합은 유일)
  CONSTRAINT uk_role_menu UNIQUE (role_id, menu_id),

  -- 체크 제약조건
  CONSTRAINT chk_menu_permissions_can_view CHECK (can_view IN ('Y', 'N')),
  CONSTRAINT chk_menu_permissions_can_create CHECK (can_create IN ('Y', 'N')),
  CONSTRAINT chk_menu_permissions_can_update CHECK (can_update IN ('Y', 'N')),
  CONSTRAINT chk_menu_permissions_can_delete CHECK (can_delete IN ('Y', 'N')),
  CONSTRAINT chk_menu_permissions_can_select CHECK (can_select IN ('Y', 'N')),
  CONSTRAINT chk_menu_permissions_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_menu_permissions_role_id ON rsms.menu_permissions(role_id) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_permissions_menu_id ON rsms.menu_permissions(menu_id) WHERE is_deleted = 'N';

-- 복합 인덱스 (역할별 메뉴 권한 조회 최적화)
CREATE INDEX idx_menu_permissions_lookup ON rsms.menu_permissions(role_id, menu_id)
  WHERE is_deleted = 'N';

-- 권한 체크 최적화 인덱스
CREATE INDEX idx_menu_permissions_view ON rsms.menu_permissions(role_id, can_view)
  WHERE is_deleted = 'N' AND can_view = 'Y';

CREATE INDEX idx_menu_permissions_create ON rsms.menu_permissions(role_id, can_create)
  WHERE is_deleted = 'N' AND can_create = 'Y';

CREATE INDEX idx_menu_permissions_update ON rsms.menu_permissions(role_id, can_update)
  WHERE is_deleted = 'N' AND can_update = 'Y';

CREATE INDEX idx_menu_permissions_delete ON rsms.menu_permissions(role_id, can_delete)
  WHERE is_deleted = 'N' AND can_delete = 'Y';

-- 코멘트 추가
COMMENT ON TABLE rsms.menu_permissions IS '메뉴-역할 권한 매핑 (역할별 메뉴 CRUD 권한)';
COMMENT ON COLUMN rsms.menu_permissions.menu_permission_id IS '메뉴권한ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.menu_permissions.role_id IS '역할 ID (roles FK)';
COMMENT ON COLUMN rsms.menu_permissions.menu_id IS '메뉴 ID (menu_items FK)';
COMMENT ON COLUMN rsms.menu_permissions.can_view IS '조회 권한 (Y/N)';
COMMENT ON COLUMN rsms.menu_permissions.can_create IS '등록 권한 (Y/N)';
COMMENT ON COLUMN rsms.menu_permissions.can_update IS '수정 권한 (Y/N)';
COMMENT ON COLUMN rsms.menu_permissions.can_delete IS '삭제 권한 (Y/N)';
COMMENT ON COLUMN rsms.menu_permissions.can_select IS '선택 권한 (Y/N)';
COMMENT ON COLUMN rsms.menu_permissions.assigned_at IS '할당 일시';
COMMENT ON COLUMN rsms.menu_permissions.assigned_by IS '할당자';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_menu_permissions_updated_at
  BEFORE UPDATE ON rsms.menu_permissions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 로그인 이력 테이블 (login_history)
-- =====================================================
-- 설명: 사용자의 모든 로그인 시도 이력을 추적하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - 성공/실패한 모든 로그인 시도를 기록
--   - 보안 감사 및 계정 잠금 정책에 활용
--   - 세션 ID와 연계하여 세션 추적 가능
-- =====================================================

-- DROP TABLE IF EXISTS rsms.login_history CASCADE;

CREATE TABLE rsms.login_history (
  -- 기본키
  login_history_id BIGSERIAL PRIMARY KEY,          -- 로그인이력ID (PK, 자동증가)

  -- 사용자 정보
  user_id BIGINT,                                  -- 사용자 ID (users FK, NULL 가능 - 실패 시)
  username VARCHAR(50) NOT NULL,                   -- 로그인 시도한 사용자명

  -- 로그인 시도 정보
  login_status VARCHAR(20) NOT NULL,               -- 로그인 상태 (SUCCESS, FAILED, LOCKED, BLOCKED)
  login_type VARCHAR(20) NOT NULL DEFAULT 'WEB',   -- 로그인 유형 (WEB, MOBILE, API)
  login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 로그인 시도 시각
  logout_at TIMESTAMP,                             -- 로그아웃 시각 (NULL: 현재 로그인 중)

  -- 실패 정보
  failure_reason VARCHAR(200),                     -- 실패 사유 (잘못된 비밀번호, 계정 잠금 등)
  failure_count INT DEFAULT 0,                     -- 연속 실패 횟수

  -- 세션 및 네트워크 정보
  session_id VARCHAR(255),                         -- Spring Session ID
  ip_address VARCHAR(45) NOT NULL,                 -- IP 주소 (IPv6 지원)
  user_agent TEXT,                                 -- User-Agent 정보

  -- 위치 정보 (선택)
  country_code VARCHAR(2),                         -- 국가 코드 (ISO 3166-1 alpha-2)
  city VARCHAR(100),                               -- 도시명

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                -- 생성자 (시스템)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_login_history_user
    FOREIGN KEY (user_id)
    REFERENCES rsms.users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_login_history_status CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED', 'BLOCKED')),
  CONSTRAINT chk_login_history_type CHECK (login_type IN ('WEB', 'MOBILE', 'API')),
  CONSTRAINT chk_login_history_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_login_history_user_id ON rsms.login_history(user_id) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_username ON rsms.login_history(username) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_login_at ON rsms.login_history(login_at DESC) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_session_id ON rsms.login_history(session_id) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_ip_address ON rsms.login_history(ip_address) WHERE is_deleted = 'N';

-- 복합 인덱스 (사용자별 최근 로그인 조회 최적화)
CREATE INDEX idx_login_history_user_recent ON rsms.login_history(user_id, login_at DESC)
  WHERE is_deleted = 'N' AND login_status = 'SUCCESS';

-- 실패 이력 조회 최적화
CREATE INDEX idx_login_history_failures ON rsms.login_history(username, login_at DESC)
  WHERE is_deleted = 'N' AND login_status = 'FAILED';

-- 코멘트 추가
COMMENT ON TABLE rsms.login_history IS '로그인 이력 (모든 로그인 시도 추적)';
COMMENT ON COLUMN rsms.login_history.login_history_id IS '로그인이력ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.login_history.user_id IS '사용자 ID (users FK, 실패 시 NULL 가능)';
COMMENT ON COLUMN rsms.login_history.username IS '로그인 시도한 사용자명';
COMMENT ON COLUMN rsms.login_history.login_status IS 'SUCCESS: 성공, FAILED: 실패, LOCKED: 계정 잠금, BLOCKED: 차단';
COMMENT ON COLUMN rsms.login_history.login_type IS 'WEB: 웹, MOBILE: 모바일, API: API';
COMMENT ON COLUMN rsms.login_history.login_at IS '로그인 시도 시각';
COMMENT ON COLUMN rsms.login_history.logout_at IS '로그아웃 시각 (NULL: 현재 로그인 중)';
COMMENT ON COLUMN rsms.login_history.failure_reason IS '실패 사유 (잘못된 비밀번호, 계정 잠금 등)';
COMMENT ON COLUMN rsms.login_history.failure_count IS '연속 실패 횟수';
COMMENT ON COLUMN rsms.login_history.session_id IS 'Spring Session ID';
COMMENT ON COLUMN rsms.login_history.ip_address IS 'IP 주소 (IPv6 지원)';
COMMENT ON COLUMN rsms.login_history.user_agent IS 'User-Agent 정보';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_login_history_updated_at
  BEFORE UPDATE ON rsms.login_history
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- 접근 로그 테이블 (access_logs)
-- =====================================================
-- 설명: 사용자의 메뉴/API 접근 이력을 추적하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - AccessLog UI와 매핑
--   - 페이지 조회, API 호출, 파일 다운로드/업로드 등 모든 접근 기록
--   - 보안 감사 및 사용 패턴 분석에 활용
-- =====================================================

-- DROP TABLE IF EXISTS rsms.access_logs CASCADE;

CREATE TABLE rsms.access_logs (
  -- 기본키
  access_log_id BIGSERIAL PRIMARY KEY,             -- 접근로그ID (PK, 자동증가)

  -- 사용자 정보
  user_id BIGINT,                                  -- 사용자 ID (users FK)
  username VARCHAR(50),                            -- 사용자명
  session_id VARCHAR(255),                         -- 세션 ID

  -- 접근 정보
  access_type VARCHAR(20) NOT NULL,                -- 접근 유형 (PAGE_VIEW, API_CALL, DOWNLOAD, UPLOAD)
  access_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 접근 시각

  -- 메뉴 정보
  menu_id BIGINT,                                  -- 메뉴 ID (menu_items FK)
  menu_name VARCHAR(100),                          -- 메뉴명
  menu_url VARCHAR(500),                           -- 메뉴 URL

  -- API 정보
  http_method VARCHAR(10),                         -- HTTP 메서드 (GET, POST, PUT, DELETE 등)
  request_uri VARCHAR(500),                        -- 요청 URI
  query_string TEXT,                               -- 쿼리 스트링
  request_body TEXT,                               -- 요청 본문 (민감 정보 제외)

  -- 응답 정보
  response_status INT,                             -- HTTP 응답 코드 (200, 404, 500 등)
  response_time_ms INT,                            -- 응답 시간 (밀리초)
  error_message TEXT,                              -- 에러 메시지 (오류 발생 시)

  -- 파일 정보 (업로드/다운로드 시)
  file_name VARCHAR(255),                          -- 파일명
  file_size BIGINT,                                -- 파일 크기 (바이트)
  file_type VARCHAR(100),                          -- 파일 유형 (MIME type)

  -- 네트워크 정보
  ip_address VARCHAR(45) NOT NULL,                 -- IP 주소 (IPv6 지원)
  user_agent TEXT,                                 -- User-Agent 정보
  referer VARCHAR(500),                            -- Referer 정보

  -- 위치 정보 (선택)
  country_code VARCHAR(2),                         -- 국가 코드 (ISO 3166-1 alpha-2)
  city VARCHAR(100),                               -- 도시명

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                -- 생성자 (시스템)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_access_logs_user
    FOREIGN KEY (user_id)
    REFERENCES rsms.users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_access_logs_menu
    FOREIGN KEY (menu_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_access_logs_type CHECK (access_type IN ('PAGE_VIEW', 'API_CALL', 'DOWNLOAD', 'UPLOAD')),
  CONSTRAINT chk_access_logs_http_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
  CONSTRAINT chk_access_logs_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_access_logs_user_id ON rsms.access_logs(user_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_username ON rsms.access_logs(username) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_session_id ON rsms.access_logs(session_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_access_at ON rsms.access_logs(access_at DESC) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_menu_id ON rsms.access_logs(menu_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_ip_address ON rsms.access_logs(ip_address) WHERE is_deleted = 'N';

-- 복합 인덱스 (사용자별 최근 접근 조회 최적화)
CREATE INDEX idx_access_logs_user_recent ON rsms.access_logs(user_id, access_at DESC)
  WHERE is_deleted = 'N';

-- 메뉴별 접근 통계 최적화
CREATE INDEX idx_access_logs_menu_stats ON rsms.access_logs(menu_id, access_at DESC)
  WHERE is_deleted = 'N' AND access_type = 'PAGE_VIEW';

-- API 성능 분석 최적화
CREATE INDEX idx_access_logs_api_performance ON rsms.access_logs(request_uri, response_time_ms)
  WHERE is_deleted = 'N' AND access_type = 'API_CALL';

-- 에러 로그 조회 최적화
CREATE INDEX idx_access_logs_errors ON rsms.access_logs(access_at DESC)
  WHERE is_deleted = 'N' AND response_status >= 400;

-- 코멘트 추가
COMMENT ON TABLE rsms.access_logs IS '접근 로그 (메뉴/API 접근 이력)';
COMMENT ON COLUMN rsms.access_logs.access_log_id IS '접근로그ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.access_logs.user_id IS '사용자 ID (users FK)';
COMMENT ON COLUMN rsms.access_logs.username IS '사용자명';
COMMENT ON COLUMN rsms.access_logs.session_id IS '세션 ID';
COMMENT ON COLUMN rsms.access_logs.access_type IS 'PAGE_VIEW: 페이지 조회, API_CALL: API 호출, DOWNLOAD: 다운로드, UPLOAD: 업로드';
COMMENT ON COLUMN rsms.access_logs.access_at IS '접근 시각';
COMMENT ON COLUMN rsms.access_logs.menu_id IS '메뉴 ID (menu_items FK)';
COMMENT ON COLUMN rsms.access_logs.menu_name IS '메뉴명';
COMMENT ON COLUMN rsms.access_logs.menu_url IS '메뉴 URL';
COMMENT ON COLUMN rsms.access_logs.http_method IS 'HTTP 메서드 (GET, POST, PUT, DELETE 등)';
COMMENT ON COLUMN rsms.access_logs.request_uri IS '요청 URI';
COMMENT ON COLUMN rsms.access_logs.response_status IS 'HTTP 응답 코드 (200, 404, 500 등)';
COMMENT ON COLUMN rsms.access_logs.response_time_ms IS '응답 시간 (밀리초)';
COMMENT ON COLUMN rsms.access_logs.ip_address IS 'IP 주소 (IPv6 지원)';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_access_logs_updated_at
  BEFORE UPDATE ON rsms.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료

-- =====================================================
-- Spring Session JDBC 테이블 (spring_session, spring_session_attributes)
-- =====================================================
-- 설명: Spring Session JDBC를 위한 세션 저장 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - Spring Session JDBC의 표준 스키마
--   - PostgreSQL 최적화 적용
--   - 세션 타임아웃: 30분 (application.yml에서 설정)
--   - 자동 정리: 15분마다 만료된 세션 삭제 (Cron 작업)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.spring_session_attributes CASCADE;
-- DROP TABLE IF EXISTS rsms.spring_session CASCADE;

-- =====================================================
-- 1. spring_session 테이블
-- =====================================================
-- 설명: 세션 메타데이터 저장
CREATE TABLE rsms.spring_session (
  -- 기본키
  primary_id CHAR(36) NOT NULL,                    -- 세션 기본 ID (UUID)
  session_id CHAR(36) NOT NULL,                    -- 세션 ID (UUID)

  -- 세션 정보
  creation_time BIGINT NOT NULL,                   -- 생성 시간 (Epoch 밀리초)
  last_access_time BIGINT NOT NULL,                -- 마지막 접근 시간 (Epoch 밀리초)
  max_inactive_interval INT NOT NULL,              -- 최대 비활성 시간 (초, 기본값: 1800 = 30분)
  expiry_time BIGINT NOT NULL,                     -- 만료 시간 (Epoch 밀리초)

  -- 사용자 정보 (Spring Security Principal)
  principal_name VARCHAR(100),                     -- 인증된 사용자명

  -- 제약조건
  CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

-- 인덱스 생성
CREATE UNIQUE INDEX spring_session_ix1 ON rsms.spring_session (session_id);
CREATE INDEX spring_session_ix2 ON rsms.spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON rsms.spring_session (principal_name);

-- 코멘트 추가
COMMENT ON TABLE rsms.spring_session IS 'Spring Session JDBC - 세션 메타데이터';
COMMENT ON COLUMN rsms.spring_session.primary_id IS '세션 기본 ID (UUID, PK)';
COMMENT ON COLUMN rsms.spring_session.session_id IS '세션 ID (UUID, 고유)';
COMMENT ON COLUMN rsms.spring_session.creation_time IS '생성 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.last_access_time IS '마지막 접근 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.max_inactive_interval IS '최대 비활성 시간 (초, 기본값: 1800 = 30분)';
COMMENT ON COLUMN rsms.spring_session.expiry_time IS '만료 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.principal_name IS '인증된 사용자명 (Spring Security Principal)';

-- =====================================================
-- 2. spring_session_attributes 테이블
-- =====================================================
-- 설명: 세션 속성(Attribute) 저장
CREATE TABLE rsms.spring_session_attributes (
  -- 기본키 (복합키)
  session_primary_id CHAR(36) NOT NULL,            -- 세션 기본 ID (spring_session FK)
  attribute_name VARCHAR(200) NOT NULL,            -- 속성 이름

  -- 속성 값
  attribute_bytes BYTEA NOT NULL,                  -- 속성 값 (직렬화된 바이트)

  -- 제약조건
  CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),

  -- 외래키 제약조건
  CONSTRAINT spring_session_attributes_fk
    FOREIGN KEY (session_primary_id)
    REFERENCES rsms.spring_session(primary_id)
    ON DELETE CASCADE
);

-- 코멘트 추가
COMMENT ON TABLE rsms.spring_session_attributes IS 'Spring Session JDBC - 세션 속성 저장';
COMMENT ON COLUMN rsms.spring_session_attributes.session_primary_id IS '세션 기본 ID (spring_session FK)';
COMMENT ON COLUMN rsms.spring_session_attributes.attribute_name IS '속성 이름';
COMMENT ON COLUMN rsms.spring_session_attributes.attribute_bytes IS '속성 값 (직렬화된 바이트)';

-- =====================================================
-- 추가 최적화 및 유지보수
-- =====================================================

-- 1. 만료된 세션 정리 함수
CREATE OR REPLACE FUNCTION rsms.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM rsms.spring_session WHERE expiry_time < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rsms.cleanup_expired_sessions() IS '만료된 세션 정리 (Cron 작업에서 호출)';

-- 2. 세션 통계 뷰 (선택)
CREATE OR REPLACE VIEW rsms.v_session_statistics AS
SELECT
  COUNT(*) AS total_sessions,
  COUNT(DISTINCT principal_name) AS unique_users,
  AVG(EXTRACT(EPOCH FROM NOW()) * 1000 - last_access_time) / 1000 AS avg_idle_seconds,
  MIN(creation_time) AS oldest_session_time,
  MAX(creation_time) AS newest_session_time
FROM rsms.spring_session
WHERE expiry_time > EXTRACT(EPOCH FROM NOW()) * 1000;

COMMENT ON VIEW rsms.v_session_statistics IS '세션 통계 뷰 (활성 세션 정보)';

-- 3. 사용자별 활성 세션 뷰
CREATE OR REPLACE VIEW rsms.v_active_user_sessions AS
SELECT
  principal_name,
  COUNT(*) AS active_session_count,
  MAX(last_access_time) AS last_activity_time
FROM rsms.spring_session
WHERE expiry_time > EXTRACT(EPOCH FROM NOW()) * 1000
  AND principal_name IS NOT NULL
GROUP BY principal_name;

COMMENT ON VIEW rsms.v_active_user_sessions IS '사용자별 활성 세션 뷰';

-- 스크립트 완료

-- =====================================================
-- 운영 가이드
-- =====================================================
-- 1. Cron 작업 설정 (15분마다 만료 세션 정리)
--    - Linux Cron: */15 * * * * psql -U rsms_user -d rsms_db -c "SELECT rsms.cleanup_expired_sessions();"
--    - Spring Scheduler: @Scheduled(cron = "0 */15 * * * *")
--
-- 2. 세션 모니터링
--    - SELECT * FROM rsms.v_session_statistics;
--    - SELECT * FROM rsms.v_active_user_sessions;
--
-- 3. 특정 사용자 세션 강제 종료
--    - DELETE FROM rsms.spring_session WHERE principal_name = 'username';
--
-- 4. 모든 세션 초기화 (긴급 상황)
--    - DELETE FROM rsms.spring_session;
--
-- 5. Spring Boot application.yml 설정
--    spring:
--      session:
--        store-type: jdbc
--        jdbc:
--          initialize-schema: never  # DDL 스크립트로 이미 생성했으므로
--          table-name: RSMS.SPRING_SESSION  # 스키마 지정
-- =====================================================
