
-- =====================================================
-- 이행점검결과보고서 테이블 (impl_inspection_reports) 생성
-- =====================================================
-- 설명: 이행점검결과보고서 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-11-12
-- 참고:
--   - impl_inspection_plans 테이블과 N:1 관계 (impl_inspection_plan_id FK)
--   - ledger_order 테이블과 N:1 관계 (ledger_order_id FK)
--   - 이행점검결과보고서ID 코드 생성 규칙: impl_inspection_plan_id + "R" + 순번(3자리)
--     예: 20250001A0001R001 = "20250001A0001"(이행점검ID) + "R" + "001"(순번)
--   - 보고서구분코드는 common_code_details의 'RPT_TYP' 그룹에서 관리
--     예: '01' (CEO보고서), '02' (임원보고서)
-- =====================================================

-- =====================================================
-- STEP 1: 이행점검결과보고서ID 자동 생성 함수
-- =====================================================

-- 이행점검ID별 순번 생성을 위한 함수
CREATE OR REPLACE FUNCTION rsms.generate_impl_inspection_report_id(p_impl_inspection_plan_id VARCHAR)
RETURNS VARCHAR(17) AS $$
DECLARE
  next_seq VARCHAR(3);
  new_id VARCHAR(17);
  max_seq INTEGER;
BEGIN
  -- 해당 이행점검ID의 최대 순번 조회
  SELECT MAX(SUBSTRING(impl_inspection_report_id, 15, 3)::INTEGER) INTO max_seq
  FROM rsms.impl_inspection_reports
  WHERE SUBSTRING(impl_inspection_report_id, 1, 13) = p_impl_inspection_plan_id;

  -- 순번 계산
  IF max_seq IS NULL THEN
    -- 해당 이행점검ID의 첫 번째 결과보고서
    next_seq := '001';
  ELSE
    -- 기존 순번에서 1 증가
    next_seq := LPAD((max_seq + 1)::TEXT, 3, '0');
  END IF;

  -- 새 ID 생성: impl_inspection_plan_id + "R" + 순번(3자리)
  new_id := p_impl_inspection_plan_id || 'R' || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: impl_inspection_reports 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.impl_inspection_reports CASCADE;

CREATE TABLE rsms.impl_inspection_reports (
  -- 기본키
  -- 코드 생성 규칙: impl_inspection_plan_id + "R" + 순번(3자리)
  -- 예시: "20250001A0001R001" = "20250001A0001"(이행점검ID) + "R" + "001"(순번)
  impl_inspection_report_id VARCHAR(17) PRIMARY KEY,  -- 이행점검결과보고서ID (PK, 업무 코드)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                -- 원장차수ID (FK → ledger_order)
  impl_inspection_plan_id VARCHAR(13) NOT NULL,       -- 이행점검ID (FK → impl_inspection_plans)

  -- 기본 정보
  report_type_cd VARCHAR(20) NOT NULL,                -- 보고서구분 (01:CEO보고서, 02:임원보고서, 03:부서별) common_code_details의 REPORT_TYCD 코드참조
  review_content TEXT,                                -- 검토내용
  review_date DATE,                                   -- 검토일자
  result TEXT,                                        -- 결과
  improvement_action TEXT,                            -- 개선조치
  remarks TEXT,                                       -- 비고

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',         -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  created_by VARCHAR(50) NOT NULL,                    -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                    -- 수정자

  -- 제약조건: 이행점검결과보고서ID 형식 검증 (13자리 이행점검ID + "R" + 3자리 숫자)
  CONSTRAINT chk_impl_inspection_report_id_format CHECK (
    impl_inspection_report_id ~ '^[0-9]{8}A[0-9]{4}R[0-9]{3}$' AND LENGTH(impl_inspection_report_id) = 17
  ),

  -- 제약조건: 보고서구분은 '01' 또는 '02'만 가능
  CONSTRAINT chk_report_type CHECK (report_type_cd IN ('01', '02')),

  -- 제약조건: 사용여부는 'Y' 또는 'N'만 가능
  CONSTRAINT chk_report_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================
-- STEP 3: 외래키 제약조건 추가
-- =====================================================

-- ledger_order 테이블 참조
ALTER TABLE rsms.impl_inspection_reports
  ADD CONSTRAINT fk_impl_inspection_reports_ledger_order
  FOREIGN KEY (ledger_order_id)
  REFERENCES rsms.ledger_order(ledger_order_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- impl_inspection_plans 테이블 참조
ALTER TABLE rsms.impl_inspection_reports
  ADD CONSTRAINT fk_impl_inspection_reports_plan
  FOREIGN KEY (impl_inspection_plan_id)
  REFERENCES rsms.impl_inspection_plans(impl_inspection_plan_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- =====================================================
-- STEP 4: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 원장차수ID 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_impl_inspection_reports_ledger_order
  ON rsms.impl_inspection_reports(ledger_order_id);

-- 이행점검ID 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_impl_inspection_reports_plan
  ON rsms.impl_inspection_reports(impl_inspection_plan_id);

-- 보고서구분 인덱스
CREATE INDEX idx_impl_inspection_reports_type
  ON rsms.impl_inspection_reports(report_type_cd);

-- 검토일자 인덱스
CREATE INDEX idx_impl_inspection_reports_review_date
  ON rsms.impl_inspection_reports(review_date);

-- 사용여부 인덱스
CREATE INDEX idx_impl_inspection_reports_is_active
  ON rsms.impl_inspection_reports(is_active);

-- 복합 인덱스: 이행점검ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_impl_inspection_reports_plan_active
  ON rsms.impl_inspection_reports(impl_inspection_plan_id, is_active);

-- 복합 인덱스: 보고서구분 + 사용여부
CREATE INDEX idx_impl_inspection_reports_type_active
  ON rsms.impl_inspection_reports(report_type_cd, is_active);

-- =====================================================
-- STEP 5: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.impl_inspection_reports IS '이행점검결과보고서 테이블 - 이행점검결과보고서 정보를 관리 (코드 체계: 이행점검ID+R+순번)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.impl_inspection_reports.impl_inspection_report_id IS '이행점검결과보고서ID (PK, 업무코드 - 형식: 이행점검ID + R + 순번3자리, 예: 20250001A0001R001)';
COMMENT ON COLUMN rsms.impl_inspection_reports.ledger_order_id IS '원장차수ID (FK → ledger_order.ledger_order_id)';
COMMENT ON COLUMN rsms.impl_inspection_reports.impl_inspection_plan_id IS '이행점검ID (FK → impl_inspection_plans.impl_inspection_plan_id)';
COMMENT ON COLUMN rsms.impl_inspection_reports.report_type_cd IS '보고서구분 (01:CEO보고서, 02:임원보고서)';
COMMENT ON COLUMN rsms.impl_inspection_reports.review_content IS '검토내용';
COMMENT ON COLUMN rsms.impl_inspection_reports.review_date IS '검토일자';
COMMENT ON COLUMN rsms.impl_inspection_reports.result IS '결과';
COMMENT ON COLUMN rsms.impl_inspection_reports.improvement_action IS '개선조치';
COMMENT ON COLUMN rsms.impl_inspection_reports.remarks IS '비고';
COMMENT ON COLUMN rsms.impl_inspection_reports.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.impl_inspection_reports.created_at IS '생성일시';
COMMENT ON COLUMN rsms.impl_inspection_reports.created_by IS '생성자';
COMMENT ON COLUMN rsms.impl_inspection_reports.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.impl_inspection_reports.updated_by IS '수정자';

-- =====================================================
-- STEP 6: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_impl_inspection_reports_updated_at
  BEFORE UPDATE ON rsms.impl_inspection_reports
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 7: 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- impl_inspection_plans 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.impl_inspection_reports (
  impl_inspection_report_id,
  ledger_order_id,
  impl_inspection_plan_id,
  report_type_cd,
  review_content,
  review_date,
  result,
  improvement_action,
  remarks,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 이행점검계획 20250001A0001의 보고서들
  (
    '20250001A0001R001',
    '20250001',
    '20250001A0001',
    '01',
    '2025년 1분기 이행점검 결과 검토',
    '2025-03-31',
    '전반적으로 양호하나 일부 개선 필요',
    '식별된 개선사항에 대해 2분기 내 조치 완료 예정',
    'CEO 보고 완료',
    'Y',
    'system',
    'system'
  ),
  (
    '20250001A0001R002',
    '20250001',
    '20250001A0001',
    '02',
    '1분기 이행점검 상세 분석',
    '2025-04-05',
    '부서별 이행률 평균 85% 달성',
    '미달 부서에 대한 특별 관리 실시',
    '임원회의 보고 자료',
    'Y',
    'system',
    'system'
  );
*/

-- =====================================================
-- STEP 8: 이행점검결과보고서ID 생성 예시 및 설명
-- =====================================================
-- Backend에서 코드를 자동 생성하는 로직:
--
-- 예시 1) 이행점검ID "20250001A0001"의 첫 번째 결과보고서 생성:
--   → rsms.generate_impl_inspection_report_id('20250001A0001') 함수 호출
--   → 반환값: "20250001A0001R001"
--
-- 예시 2) 이행점검ID "20250001A0001"의 두 번째 결과보고서 생성:
--   → rsms.generate_impl_inspection_report_id('20250001A0001') 함수 호출
--   → 반환값: "20250001A0001R002"
--
-- Java/Spring Boot 예시:
--   @PrePersist
--   public void prePersist() {
--     if (this.implInspectionReportId == null) {
--       String generatedId = jdbcTemplate.queryForObject(
--         "SELECT rsms.generate_impl_inspection_report_id(?)",
--         String.class,
--         this.implInspectionPlanId
--       );
--       this.implInspectionReportId = generatedId;
--     }
--   }
-- =====================================================

-- =====================================================
-- 권한 설정
-- =====================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.impl_inspection_reports TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
