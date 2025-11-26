-- =====================================================================================
-- V010: 이행점검계획 테이블 생성 (impl_inspection_plans)
-- =====================================================================================
-- 설명:
--   - 원장차수별 이행점검계획 정보를 관리하는 테이블
--   - 이행점검ID 코드 생성 규칙: ledger_order_id + "A" + 순번(4자리)
--     예: 20250001A0001 = "20250001"(원장차수ID) + "A" + "0001"(순번)
-- 작성일: 2025-11-26
-- Flyway 마이그레이션: V010
-- 참조: database/scripts/26.create_table_impl_inspection_plans.sql
-- =====================================================================================


-- =====================================================
-- 1. 이행점검ID 자동 생성 함수
-- =====================================================

-- 원장차수별 순번 생성을 위한 함수
CREATE OR REPLACE FUNCTION rsms.generate_impl_inspection_plan_id(p_ledger_order_id VARCHAR)
RETURNS VARCHAR(13) AS $$
DECLARE
  next_seq VARCHAR(4);
  new_id VARCHAR(13);
  max_seq INTEGER;
BEGIN
  -- 해당 원장차수의 최대 순번 조회
  SELECT MAX(SUBSTRING(impl_inspection_plan_id, 10, 4)::INTEGER) INTO max_seq
  FROM rsms.impl_inspection_plans
  WHERE SUBSTRING(impl_inspection_plan_id, 1, 8) = p_ledger_order_id;

  -- 순번 계산
  IF max_seq IS NULL THEN
    -- 해당 원장차수의 첫 번째 이행점검계획
    next_seq := '0001';
  ELSE
    -- 기존 순번에서 1 증가
    next_seq := LPAD((max_seq + 1)::TEXT, 4, '0');
  END IF;

  -- 새 ID 생성: ledger_order_id + "A" + 순번(4자리)
  new_id := p_ledger_order_id || 'A' || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 2. impl_inspection_plans 테이블 생성
-- =====================================================

CREATE TABLE rsms.impl_inspection_plans (
  -- 기본키
  impl_inspection_plan_id VARCHAR(13) PRIMARY KEY,        -- 이행점검ID (PK, 업무 코드)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK -> ledger_order)

  -- 기본 정보
  impl_inspection_name VARCHAR(200) NOT NULL,             -- 이행점검명
  inspection_type_cd VARCHAR(20),                         -- 점검유형코드 (common_code_details 참조)
  impl_inspection_start_date DATE NOT NULL,               -- 이행점검시작일
  impl_inspection_end_date DATE NOT NULL,                 -- 이행점검종료일
  impl_inspection_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 이행점검계획상태코드
  remarks TEXT,                                           -- 비고

  -- 상태 정보
  is_active CHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  created_by VARCHAR(50) NOT NULL,                        -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                        -- 수정자

  -- 제약조건
  CONSTRAINT chk_impl_inspection_plan_id_format CHECK (
    impl_inspection_plan_id ~ '^[0-9]{8}A[0-9]{4}$' AND LENGTH(impl_inspection_plan_id) = 13
  ),
  CONSTRAINT chk_impl_inspection_date_range CHECK (
    impl_inspection_start_date <= impl_inspection_end_date
  ),
  CONSTRAINT chk_impl_inspection_is_active CHECK (is_active IN ('Y', 'N'))
);


-- =====================================================
-- 3. 외래키 제약조건 추가
-- =====================================================

ALTER TABLE rsms.impl_inspection_plans
  ADD CONSTRAINT fk_impl_inspection_plans_ledger_order
  FOREIGN KEY (ledger_order_id)
  REFERENCES rsms.ledger_order(ledger_order_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


-- =====================================================
-- 4. 인덱스 생성
-- =====================================================

CREATE INDEX idx_impl_inspection_plans_ledger_order ON rsms.impl_inspection_plans(ledger_order_id);
CREATE INDEX idx_impl_inspection_plans_type ON rsms.impl_inspection_plans(inspection_type_cd);
CREATE INDEX idx_impl_inspection_plans_status ON rsms.impl_inspection_plans(impl_inspection_status_cd);
CREATE INDEX idx_impl_inspection_plans_is_active ON rsms.impl_inspection_plans(is_active);
CREATE INDEX idx_impl_inspection_plans_start_date ON rsms.impl_inspection_plans(impl_inspection_start_date);
CREATE INDEX idx_impl_inspection_plans_end_date ON rsms.impl_inspection_plans(impl_inspection_end_date);
CREATE INDEX idx_impl_inspection_plans_ledger_active ON rsms.impl_inspection_plans(ledger_order_id, is_active);
CREATE INDEX idx_impl_inspection_plans_status_active ON rsms.impl_inspection_plans(impl_inspection_status_cd, is_active);


-- =====================================================
-- 5. 코멘트 추가
-- =====================================================

COMMENT ON TABLE rsms.impl_inspection_plans IS '이행점검계획 테이블 - 원장차수별 이행점검계획 정보를 관리';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_plan_id IS '이행점검ID (PK, 형식: 원장차수ID + A + 순번4자리)';
COMMENT ON COLUMN rsms.impl_inspection_plans.ledger_order_id IS '원장차수ID (FK -> ledger_order)';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_name IS '이행점검명';
COMMENT ON COLUMN rsms.impl_inspection_plans.inspection_type_cd IS '점검유형코드 (common_code_details 참조)';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_start_date IS '이행점검시작일';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_end_date IS '이행점검종료일';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_status_cd IS '이행점검계획상태코드';
COMMENT ON COLUMN rsms.impl_inspection_plans.remarks IS '비고';
COMMENT ON COLUMN rsms.impl_inspection_plans.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.impl_inspection_plans.created_at IS '생성일시';
COMMENT ON COLUMN rsms.impl_inspection_plans.created_by IS '생성자';
COMMENT ON COLUMN rsms.impl_inspection_plans.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.impl_inspection_plans.updated_by IS '수정자';


-- =====================================================
-- 6. 트리거 생성
-- =====================================================

CREATE TRIGGER trg_impl_inspection_plans_updated_at
  BEFORE UPDATE ON rsms.impl_inspection_plans
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();
