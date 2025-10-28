
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
