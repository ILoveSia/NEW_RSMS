-- =====================================================================================
-- 06. responsibilities 테이블 생성 (책무 테이블)
-- =====================================================================================
-- 설명: 책무 정보를 관리하는 테이블
-- 작성일: 2025-09-24
-- 수정일: 2025-01-05 - PK를 자동증가에서 업무 코드로 변경
-- =====================================================================================
-- 변경사항:
--   - PK: responsibility_id (BIGSERIAL) → responsibility_cd (VARCHAR, 업무 코드)
--   - 코드 생성 규칙: ledger_order_id + responsibility_cat + 순번(4자리)
--   - 예시: "20250001R0001" (20250001원장차수 + R카테고리 + 0001순번)
--   - 기존 responsibility_cd 컬럼 삭제 (PK로 대체되어 중복 제거)
-- =====================================================================================

-- 기존 테이블이 존재하면 삭제 (개발 환경에서만 사용, 운영 환경에서는 주석 처리 필요)
DROP TABLE IF EXISTS rsms.responsibilities CASCADE;

-- responsibilities 테이블 생성
CREATE TABLE rsms.responsibilities (
  -- 기본키 (업무 코드)
  -- 코드 생성 규칙: ledger_order_id + responsibility_cat + 순번(4자리)
  -- 예시: "20250001R0001" = "20250001"(원장차수) + "R"(지정책임자) + "0001"(순번)
  responsibility_cd VARCHAR(20) PRIMARY KEY,              -- 책무코드 (PK, 업무 코드)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK → ledger_order)
  positions_id BIGINT NOT NULL,                           -- 직책ID (FK → positions)

  -- 기본 정보
  responsibility_cat VARCHAR(20) NOT NULL,                -- 책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조)
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

-- 복합 인덱스: 원장차수 + 책무카테고리 (코드 생성 시 최대 순번 조회용)
CREATE INDEX idx_responsibilities_ledger_cat ON rsms.responsibilities(ledger_order_id, responsibility_cat);

-- =====================================================================================
-- 코멘트 추가
-- =====================================================================================
-- 테이블 코멘트
COMMENT ON TABLE rsms.responsibilities IS '책무 정보를 관리하는 테이블 (코드 체계: 원장차수+카테고리+순번)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.responsibilities.responsibility_cd IS '책무코드 (PK, 업무코드 - 형식: ledger_order_id + responsibility_cat + 순번4자리, 예: 20250001M0001)';
COMMENT ON COLUMN rsms.responsibilities.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.responsibilities.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_cat IS '책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조, 예: R, C, M, B)';
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
