
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
