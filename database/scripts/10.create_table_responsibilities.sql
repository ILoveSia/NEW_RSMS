-- =====================================================================================
-- 06. responsibilities 테이블 생성 (책무 테이블)
-- =====================================================================================
-- 설명: 책무 정보를 관리하는 테이블
-- 작성일: 2025-09-24
-- =====================================================================================

-- 기존 테이블이 존재하면 삭제 (개발 환경에서만 사용, 운영 환경에서는 주석 처리 필요)
DROP TABLE IF EXISTS rsms.responsibilities CASCADE;

-- responsibilities 테이블 생성
CREATE TABLE rsms.responsibilities (
  -- 기본키 (대리키)
  responsibility_id BIGSERIAL PRIMARY KEY,                -- 책무ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK → ledger_order)
  positions_id BIGINT NOT NULL,                           -- 직책ID (FK → positions)

  -- 기본 정보
  responsibility_cat VARCHAR(20) NOT NULL,                -- 책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조)
  responsibility_cd VARCHAR(20) NOT NULL,                 -- 책무코드 (common_code_details의 RSBT_OBLG_CD 그룹 참조)
  responsibility_info VARCHAR(1000) NOT NULL,             -- 책무내용
  responsibility_legal VARCHAR(1000) NOT NULL,            -- 책무관련근거 (직접입력)

  -- 만료 정보
  expiration_date DATE NOT NULL DEFAULT '9999-12-31',     -- 만료일 (기본값: 9999-12-31)

  -- 상태 정보
  responsibility_status VARCHAR(20) NULL,                 -- 상태 (나중에 사용 예정)
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',              -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_responsibilities_ledger_order FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id) ON DELETE RESTRICT,
  CONSTRAINT fk_responsibilities_positions FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id) ON DELETE RESTRICT,
  CONSTRAINT chk_responsibilities_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================================================
-- 인덱스 생성
-- =====================================================================================
-- 원장차수ID 조회용 인덱스
CREATE INDEX idx_responsibilities_ledger_order_id ON rsms.responsibilities(ledger_order_id);

-- 직책ID 조회용 인덱스
CREATE INDEX idx_responsibilities_positions_id ON rsms.responsibilities(positions_id);

-- 책무카테고리 조회용 인덱스
CREATE INDEX idx_responsibilities_cat ON rsms.responsibilities(responsibility_cat);

-- 책무코드 조회용 인덱스
CREATE INDEX idx_responsibilities_cd ON rsms.responsibilities(responsibility_cd);

-- 사용여부 조회용 인덱스
CREATE INDEX idx_responsibilities_is_active ON rsms.responsibilities(is_active);

-- 상태 조회용 인덱스
CREATE INDEX idx_responsibilities_status ON rsms.responsibilities(responsibility_status);

-- 만료일 조회용 인덱스
CREATE INDEX idx_responsibilities_expiration_date ON rsms.responsibilities(expiration_date);

-- 복합 인덱스: 원장차수 + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_responsibilities_ledger_active ON rsms.responsibilities(ledger_order_id, is_active);

-- 복합 인덱스: 직책ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_responsibilities_positions_active ON rsms.responsibilities(positions_id, is_active);

-- 복합 인덱스: 책무카테고리 + 책무코드 (계층 조회용)
CREATE INDEX idx_responsibilities_cat_cd ON rsms.responsibilities(responsibility_cat, responsibility_cd);

-- =====================================================================================
-- 코멘트 추가
-- =====================================================================================
-- 테이블 코멘트
COMMENT ON TABLE rsms.responsibilities IS '책무 정보를 관리하는 테이블';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.responsibilities.responsibility_id IS '책무ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.responsibilities.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.responsibilities.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_cat IS '책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_cd IS '책무코드 (common_code_details의 RSBT_OBLG_CD 그룹 참조)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_info IS '책무내용';
COMMENT ON COLUMN rsms.responsibilities.responsibility_legal IS '책무관련근거 (직접입력)';
COMMENT ON COLUMN rsms.responsibilities.expiration_date IS '만료일 (기본값: 9999-12-31)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_status IS '상태 (나중에 사용 예정)';
COMMENT ON COLUMN rsms.responsibilities.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.responsibilities.created_at IS '생성일시';
COMMENT ON COLUMN rsms.responsibilities.created_by IS '생성자';
COMMENT ON COLUMN rsms.responsibilities.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.responsibilities.updated_by IS '수정자';

-- =====================================================================================
-- 트리거 생성 (updated_at 자동 갱신)
-- =====================================================================================
CREATE TRIGGER trigger_responsibilities_updated_at
  BEFORE UPDATE ON rsms.responsibilities
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
INSERT INTO rsms.responsibilities (
  ledger_order_id,
  positions_id,
  responsibility_cat,
  responsibility_cd,
  responsibility_info,
  responsibility_legal,
  expiration_date,
  responsibility_status,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 샘플 데이터 1: 리스크 관리 책무
  (
    '20240101',
    1,
    'RISK_MGT',
    'RISK_001',
    '리스크 식별 및 평가 수행',
    '은행업감독규정 제00조',
    '9999-12-31',
    'ACTIVE',
    'Y',
    'system',
    'system'
  ),
  -- 샘플 데이터 2: 내부통제 책무
  (
    '20240101',
    2,
    'INTERNAL_CTRL',
    'CTRL_001',
    '내부통제 활동 수행 및 모니터링',
    '내부통제운영규정 제00조',
    '9999-12-31',
    'ACTIVE',
    'Y',
    'system',
    'system'
  ),
  -- 샘플 데이터 3: 준법 감시 책무
  (
    '20240101',
    3,
    'COMPLIANCE',
    'COMP_001',
    '준법감시 활동 수행',
    '준법감시규정 제00조',
    '9999-12-31',
    'ACTIVE',
    'Y',
    'system',
    'system'
  );
*/

-- =====================================================================================
-- 권한 설정
-- =====================================================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.responsibilities TO rsms_app;
--GRANT USAGE, SELECT ON SEQUENCE rsms.responsibilities_responsibility_id_seq TO rsms_app;

-- =====================================================================================
-- 스크립트 완료
-- =====================================================================================
