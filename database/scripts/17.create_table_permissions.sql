
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
