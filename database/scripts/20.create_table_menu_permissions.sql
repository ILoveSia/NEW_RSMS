
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
