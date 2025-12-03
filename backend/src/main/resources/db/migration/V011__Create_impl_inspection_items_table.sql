-- =====================================================================================
-- V011: 이행점검항목 테이블 생성 (impl_inspection_items)
-- =====================================================================================
-- 설명:
--   - 이행점검계획별 점검항목 정보를 관리하는 테이블
--   - 이행점검항목ID 코드 생성 규칙: impl_inspection_plan_id + "I" + 순번(6자리)
--     예: 20250001A0001I000001
--   - 3단계 상태코드 분리: 점검결과상태/개선이행상태/최종점검결과
-- 작성일: 2025-11-26
-- Flyway 마이그레이션: V011
-- 참조: database/scripts/27.create_table_impl_inspection_items.sql
-- =====================================================================================


-- =====================================================
-- 1. 이행점검항목ID 자동 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION rsms.generate_impl_inspection_item_id(p_impl_inspection_plan_id VARCHAR)
RETURNS VARCHAR(20) AS $$
DECLARE
  next_seq VARCHAR(6);
  new_id VARCHAR(20);
  max_seq INTEGER;
BEGIN
  -- 해당 이행점검계획의 최대 순번 조회
  SELECT MAX(SUBSTRING(impl_inspection_item_id, 15, 6)::INTEGER) INTO max_seq
  FROM rsms.impl_inspection_items
  WHERE SUBSTRING(impl_inspection_item_id, 1, 13) = p_impl_inspection_plan_id;

  -- 순번 계산
  IF max_seq IS NULL THEN
    next_seq := '000001';
  ELSE
    next_seq := LPAD((max_seq + 1)::TEXT, 6, '0');
  END IF;

  -- 새 ID 생성
  new_id := p_impl_inspection_plan_id || 'I' || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 2. impl_inspection_items 테이블 생성
-- =====================================================

CREATE TABLE rsms.impl_inspection_items (
  -- 기본키
  impl_inspection_item_id VARCHAR(20) PRIMARY KEY,        -- 이행점검항목ID (PK, 업무 코드)

  -- 외래키
  impl_inspection_plan_id VARCHAR(13) NOT NULL,           -- 이행점검ID (FK -> impl_inspection_plans)
  manual_cd VARCHAR(50) NOT NULL,                         -- 부서장업무메뉴얼CD (FK -> dept_manager_manuals)

  -- 1단계: 점검 정보
  inspector_id VARCHAR(50),                               -- 점검자ID
  inspection_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
  inspection_result_content TEXT,                         -- 점검결과내용
  inspection_date DATE,                                   -- 점검일자

  -- 2단계: 개선이행 정보
  improvement_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 개선이행상태코드
  improvement_manager_id VARCHAR(50),                     -- 개선담당자ID
  improvement_plan_content TEXT,                          -- 개선계획내용
  improvement_plan_date DATE,                             -- 개선계획수립일자
  improvement_plan_approved_by VARCHAR(50),               -- 개선계획 승인자ID
  improvement_plan_approved_date DATE,                    -- 개선계획 승인일자
  improvement_detail_content TEXT,                        -- 개선이행세부내용
  improvement_completed_date DATE,                        -- 개선이행완료일자

  -- 3단계: 최종점검 정보
  final_inspection_result_cd VARCHAR(20),                 -- 최종점검결과코드 (01:승인, 02:반려)
  final_inspection_result_content TEXT,                   -- 최종점검결과내용
  final_inspection_date DATE,                             -- 최종점검일자

  -- 최종결과 (자동 계산)
  is_final_completed CHAR(1) GENERATED ALWAYS AS (
    CASE
      WHEN inspection_status_cd = '02' THEN 'Y'
      WHEN inspection_status_cd = '03' AND final_inspection_result_cd = '01' THEN 'Y'
      ELSE 'N'
    END
  ) STORED,                                               -- 이행점검 최종결과여부

  rejection_count INTEGER DEFAULT 0,                      -- 반려 횟수

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',              -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) NOT NULL,

  -- 제약조건
  CONSTRAINT chk_impl_inspection_item_id_format CHECK (
    impl_inspection_item_id ~ '^[0-9]{8}A[0-9]{4}I[0-9]{6}$' AND LENGTH(impl_inspection_item_id) = 20
  ),
  CONSTRAINT chk_inspection_status CHECK (inspection_status_cd IN ('01', '02', '03')),
  CONSTRAINT chk_improvement_status CHECK (improvement_status_cd IN ('01', '02', '03')),
  CONSTRAINT chk_final_inspection_result CHECK (final_inspection_result_cd IS NULL OR final_inspection_result_cd IN ('01', '02')),
  CONSTRAINT chk_impl_inspection_items_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_inspection_date_required CHECK (
    (inspection_status_cd IN ('02', '03') AND inspection_date IS NOT NULL) OR
    (inspection_status_cd = '01')
  ),
  CONSTRAINT chk_improvement_completed_date_required CHECK (
    (improvement_status_cd = '03' AND improvement_completed_date IS NOT NULL) OR
    (improvement_status_cd IN ('01', '02'))
  )
);


-- =====================================================
-- 3. 외래키 제약조건 추가
-- =====================================================

ALTER TABLE rsms.impl_inspection_items
  ADD CONSTRAINT fk_impl_inspection_items_plan
  FOREIGN KEY (impl_inspection_plan_id)
  REFERENCES rsms.impl_inspection_plans(impl_inspection_plan_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE rsms.impl_inspection_items
  ADD CONSTRAINT fk_impl_inspection_items_manual
  FOREIGN KEY (manual_cd)
  REFERENCES rsms.dept_manager_manuals(manual_cd)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;


-- =====================================================
-- 4. 인덱스 생성
-- =====================================================

CREATE INDEX idx_impl_inspection_items_plan_id ON rsms.impl_inspection_items(impl_inspection_plan_id);
CREATE INDEX idx_impl_inspection_items_manual_cd ON rsms.impl_inspection_items(manual_cd);
CREATE INDEX idx_impl_inspection_items_inspector ON rsms.impl_inspection_items(inspector_id);
CREATE INDEX idx_impl_inspection_items_improvement_mgr ON rsms.impl_inspection_items(improvement_manager_id);
CREATE INDEX idx_impl_inspection_items_plan_approved_by ON rsms.impl_inspection_items(improvement_plan_approved_by);
CREATE INDEX idx_impl_inspection_items_insp_status ON rsms.impl_inspection_items(inspection_status_cd);
CREATE INDEX idx_impl_inspection_items_improv_status ON rsms.impl_inspection_items(improvement_status_cd);
CREATE INDEX idx_impl_inspection_items_final_result ON rsms.impl_inspection_items(final_inspection_result_cd);
CREATE INDEX idx_impl_inspection_items_final_completed ON rsms.impl_inspection_items(is_final_completed);
CREATE INDEX idx_impl_inspection_items_is_active ON rsms.impl_inspection_items(is_active);
CREATE INDEX idx_impl_inspection_items_plan_active ON rsms.impl_inspection_items(impl_inspection_plan_id, is_active);
CREATE INDEX idx_impl_inspection_items_insp_status_active ON rsms.impl_inspection_items(inspection_status_cd, is_active);
CREATE INDEX idx_impl_inspection_items_improv_status_active ON rsms.impl_inspection_items(improvement_status_cd, is_active);
CREATE INDEX idx_impl_inspection_items_final_active ON rsms.impl_inspection_items(is_final_completed, is_active);


-- =====================================================
-- 5. 코멘트 추가
-- =====================================================

COMMENT ON TABLE rsms.impl_inspection_items IS '이행점검항목 테이블 - 이행점검계획별 점검항목 정보 및 진행상태 관리';
COMMENT ON COLUMN rsms.impl_inspection_items.impl_inspection_item_id IS '이행점검항목ID (PK, 형식: 이행점검ID + I + 순번6자리)';
COMMENT ON COLUMN rsms.impl_inspection_items.impl_inspection_plan_id IS '이행점검ID (FK -> impl_inspection_plans)';
COMMENT ON COLUMN rsms.impl_inspection_items.manual_cd IS '부서장업무메뉴얼CD (FK -> dept_manager_manuals)';
COMMENT ON COLUMN rsms.impl_inspection_items.inspector_id IS '점검자ID';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_status_cd IS '점검결과상태코드 (01:미점검, 02:적정, 03:부적정)';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_result_content IS '점검결과내용';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_date IS '점검일자';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_status_cd IS '개선이행상태코드';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_manager_id IS '개선담당자ID';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_content IS '개선계획내용';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_date IS '개선계획수립일자';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_approved_by IS '개선계획 승인자ID';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_approved_date IS '개선계획 승인일자';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_detail_content IS '개선이행세부내용';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_completed_date IS '개선이행완료일자';
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_result_cd IS '최종점검결과코드 (01:승인, 02:반려)';
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_result_content IS '최종점검결과내용';
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_date IS '최종점검일자';
COMMENT ON COLUMN rsms.impl_inspection_items.is_final_completed IS '이행점검 최종결과여부 (자동계산)';
COMMENT ON COLUMN rsms.impl_inspection_items.rejection_count IS '반려 횟수';
COMMENT ON COLUMN rsms.impl_inspection_items.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.impl_inspection_items.created_at IS '생성일시';
COMMENT ON COLUMN rsms.impl_inspection_items.created_by IS '생성자';
COMMENT ON COLUMN rsms.impl_inspection_items.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.impl_inspection_items.updated_by IS '수정자';


-- =====================================================
-- 6. 트리거 생성
-- =====================================================

-- updated_at 자동 갱신
CREATE TRIGGER trg_impl_inspection_items_updated_at
  BEFORE UPDATE ON rsms.impl_inspection_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 반려 횟수 자동 증가 함수
CREATE OR REPLACE FUNCTION rsms.increment_rejection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.final_inspection_result_cd = '02' AND
     (OLD.final_inspection_result_cd IS NULL OR OLD.final_inspection_result_cd != '02') THEN
    NEW.rejection_count := COALESCE(OLD.rejection_count, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_rejection_count
  BEFORE UPDATE ON rsms.impl_inspection_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.increment_rejection_count();
