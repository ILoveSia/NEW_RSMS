
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
