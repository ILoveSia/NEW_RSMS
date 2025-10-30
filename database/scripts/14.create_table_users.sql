
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
  emp_no VARCHAR(20) UNIQUE,                           -- 직원번호 (employees FK, NULL 가능: 외주/임시계정)

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
COMMENT ON COLUMN rsms.users.emp_no IS '직원번호 (employees FK, NULL 가능 - 외주직원/파견직/임시계정/시스템계정)';
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

-- =====================================================
-- 중요: emp_no는 NULL 허용됩니다
-- =====================================================
-- 사용 케이스:
--   1. 정규 직원: emp_no 값 있음 (employees 테이블과 연결)
--   2. 외주 직원: emp_no NULL (employees 없음)
--   3. 파견직: emp_no NULL (외부 소속)
--   4. 임시 계정: emp_no NULL (단기 사용)
--   5. 시스템 계정: emp_no NULL 또는 가상 직원번호
--
-- FK 제약조건은 128.insert_initial_employees.sql에서 추가됩니다:
--   ALTER TABLE rsms.users
--     ADD CONSTRAINT fk_users_emp_no FOREIGN KEY (emp_no)
--       REFERENCES rsms.employees(emp_no)
--       ON DELETE RESTRICT
--       ON UPDATE CASCADE;
-- =====================================================

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON rsms.users
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료
