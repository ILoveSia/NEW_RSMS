
-- =====================================================
-- 이행점검계획 테이블 (impl_inspection_plans) 생성
-- =====================================================
-- 설명: 원장차수별 이행점검계획 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-11-08
-- 참고:
--   - ledger_order 테이블과 N:1 관계 (ledger_order_id FK)
--   - 이행점검ID 코드 생성 규칙: ledger_order_id + "A" + 순번(4자리)
--     예: 20250001A0001 = "20250001"(원장차수ID) + "A" + "0001"(순번)
--   - 이행점검계획상태코드는 common_code_details의 'IMPL_INSP_ST' 그룹에서 관리
--     예: 'PLAN' (계획), 'PROG' (진행중), 'COMP' (완료), 'HOLD' (보류)
-- =====================================================

-- =====================================================
-- STEP 1: 이행점검ID 자동 생성 함수
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
-- STEP 2: impl_inspection_plans 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.impl_inspection_plans CASCADE;

CREATE TABLE rsms.impl_inspection_plans (
  -- 기본키
  -- 코드 생성 규칙: ledger_order_id + "A" + 순번(4자리)
  -- 예시: "20250001A0001" = "20250001"(원장차수ID) + "A" + "0001"(순번)
  impl_inspection_plan_id VARCHAR(13) PRIMARY KEY,        -- 이행점검ID (PK, 업무 코드)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  impl_inspection_name VARCHAR(200) NOT NULL,             -- 이행점검명
  inspection_type_cd VARCHAR(20),                          -- 점검유형코드 (common_code_details.group_code = 'FLFL_TYP_DVCD' 참조)
  impl_inspection_start_date DATE NOT NULL,               -- 이행점검시작일
  impl_inspection_end_date DATE NOT NULL,                 -- 이행점검종료일
  impl_inspection_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 이행점검계획상태코드 (common_code_details.group_code = 'FLFL_STCD' 참조)
  remarks TEXT,                                            -- 비고

  -- 상태 정보
  is_active CHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  created_by VARCHAR(50) NOT NULL,                         -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                         -- 수정자

  -- 제약조건: 이행점검ID 형식 검증 (8자리 숫자 + "A" + 4자리 숫자)
  CONSTRAINT chk_impl_inspection_plan_id_format CHECK (
    impl_inspection_plan_id ~ '^[0-9]{8}A[0-9]{4}$' AND LENGTH(impl_inspection_plan_id) = 13
  ),

  -- 제약조건: 시작일 <= 종료일
  CONSTRAINT chk_impl_inspection_date_range CHECK (
    impl_inspection_start_date <= impl_inspection_end_date
  ),

  -- 제약조건: 사용여부는 'Y' 또는 'N'만 가능
  CONSTRAINT chk_impl_inspection_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================
-- STEP 3: 외래키 제약조건 추가
-- =====================================================

-- ledger_order 테이블 참조
ALTER TABLE rsms.impl_inspection_plans
  ADD CONSTRAINT fk_impl_inspection_plans_ledger_order
  FOREIGN KEY (ledger_order_id)
  REFERENCES rsms.ledger_order(ledger_order_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- =====================================================
-- STEP 4: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 원장차수ID 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_impl_inspection_plans_ledger_order
  ON rsms.impl_inspection_plans(ledger_order_id);

-- 점검유형코드 인덱스
CREATE INDEX idx_impl_inspection_plans_type
  ON rsms.impl_inspection_plans(inspection_type_cd);

-- 이행점검계획상태코드 인덱스
CREATE INDEX idx_impl_inspection_plans_status
  ON rsms.impl_inspection_plans(impl_inspection_status_cd);

-- 사용여부 인덱스
CREATE INDEX idx_impl_inspection_plans_is_active
  ON rsms.impl_inspection_plans(is_active);

-- 이행점검시작일 인덱스
CREATE INDEX idx_impl_inspection_plans_start_date
  ON rsms.impl_inspection_plans(impl_inspection_start_date);

-- 이행점검종료일 인덱스
CREATE INDEX idx_impl_inspection_plans_end_date
  ON rsms.impl_inspection_plans(impl_inspection_end_date);

-- 복합 인덱스: 원장차수ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_impl_inspection_plans_ledger_active
  ON rsms.impl_inspection_plans(ledger_order_id, is_active);

-- 복합 인덱스: 이행점검상태코드 + 사용여부
CREATE INDEX idx_impl_inspection_plans_status_active
  ON rsms.impl_inspection_plans(impl_inspection_status_cd, is_active);

-- =====================================================
-- STEP 5: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.impl_inspection_plans IS '이행점검계획 테이블 - 원장차수별 이행점검계획 정보를 관리 (코드 체계: 원장차수ID+A+순번)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_plan_id IS '이행점검ID (PK, 업무코드 - 형식: 원장차수ID + A + 순번4자리, 예: 20250001A0001)';
COMMENT ON COLUMN rsms.impl_inspection_plans.ledger_order_id IS '원장차수ID (FK → ledger_order.ledger_order_id)';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_name IS '이행점검명';
COMMENT ON COLUMN rsms.impl_inspection_plans.inspection_type_cd IS '점검유형코드 (common_code_details 참조 - 예: 정기점검, 특별점검 등)';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_start_date IS '이행점검시작일';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_end_date IS '이행점검종료일';
COMMENT ON COLUMN rsms.impl_inspection_plans.impl_inspection_status_cd IS '이행점검계획상태코드 (common_code_details.group_cd = FLFL_STCD 참조)';
COMMENT ON COLUMN rsms.impl_inspection_plans.remarks IS '비고';
COMMENT ON COLUMN rsms.impl_inspection_plans.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.impl_inspection_plans.created_at IS '생성일시';
COMMENT ON COLUMN rsms.impl_inspection_plans.created_by IS '생성자';
COMMENT ON COLUMN rsms.impl_inspection_plans.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.impl_inspection_plans.updated_by IS '수정자';

-- =====================================================
-- STEP 6: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_impl_inspection_plans_updated_at
  BEFORE UPDATE ON rsms.impl_inspection_plans
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 7: 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- ledger_order 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.impl_inspection_plans (
  impl_inspection_plan_id,
  ledger_order_id,
  impl_inspection_name,
  impl_inspection_start_date,
  impl_inspection_end_date,
  impl_inspection_status_cd,
  remarks,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 2025년 1차 원장차수(20250001)의 이행점검계획들
  ('20250001A0001', '20250001', '2025년 1차 이행점검계획', '2025-01-01', '2025-03-31', '01', '1분기 이행점검', 'Y', 'system', 'system'),
  ('20250001A0002', '20250001', '2025년 2차 이행점검계획', '2025-04-01', '2025-06-30', '01', '2분기 이행점검', 'Y', 'system', 'system'),
  ('20250001A0003', '20250001', '2025년 3차 이행점검계획', '2025-07-01', '2025-09-30', '01', '3분기 이행점검', 'Y', 'system', 'system'),
  ('20250001A0004', '20250001', '2025년 4차 이행점검계획', '2025-10-01', '2025-12-31', '01', '4분기 이행점검', 'Y', 'system', 'system'),

  -- 2025년 2차 원장차수(20250002)의 이행점검계획들
  ('20250002A0001', '20250002', '2025년 하반기 특별 이행점검', '2025-07-01', '2025-12-31', '02', '하반기 특별 점검', 'Y', 'system', 'system'),
  ('20250002A0002', '20250002', '2025년 연말 종합 이행점검', '2025-12-01', '2025-12-31', '01', '연말 종합 점검', 'Y', 'system', 'system');
*/

-- =====================================================
-- STEP 8: 이행점검ID 생성 예시 및 설명
-- =====================================================
-- Backend에서 코드를 자동 생성하는 로직:
--
-- 예시 1) 원장차수ID "20250001"의 첫 번째 이행점검계획 생성:
--   → rsms.generate_impl_inspection_plan_id('20250001') 함수 호출
--   → 반환값: "20250001A0001"
--
-- 예시 2) 원장차수ID "20250001"의 두 번째 이행점검계획 생성:
--   → rsms.generate_impl_inspection_plan_id('20250001') 함수 호출
--   → 반환값: "20250001A0002"
--
-- Java/Spring Boot 예시:
--   @PrePersist
--   public void prePersist() {
--     if (this.implInspectionPlanId == null) {
--       String generatedId = jdbcTemplate.queryForObject(
--         "SELECT rsms.generate_impl_inspection_plan_id(?)",
--         String.class,
--         this.ledgerOrderId
--       );
--       this.implInspectionPlanId = generatedId;
--     }
--   }
-- =====================================================

-- =====================================================
-- 권한 설정
-- =====================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.impl_inspection_plans TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
