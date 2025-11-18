
-- =====================================================
-- 이행점검항목 테이블 (impl_inspection_items) 생성
-- =====================================================
-- 설명: 이행점검계획별 점검항목 정보를 관리하는 테이블
-- 작성자: User + Claude AI
-- 작성일: 2025-11-08
-- 참고:
--   - impl_inspection_plans 테이블과 N:1 관계 (impl_inspection_plan_id FK)
--   - dept_manager_manuals 테이블과 N:1 관계 (manual_cd FK)
--   - 이행점검항목ID 코드 생성 규칙: impl_inspection_plan_id + "I" + 순번(6자리)
--     예: 20250001A0001I000001 = "20250001A0001"(이행점검ID) + "I" + "000001"(순번)
--   - 3단계 상태코드 분리 방식:
--     1) 점검결과상태코드 (INSPECTION_STATUS): 미점검/적정/부적정
--     2) 개선이행상태코드 (IMPROVEMENT_STATUS): 개선미이행/진행중/완료
--     3) 최종점검결과코드 (FINAL_INSPECTION_RESULT): 승인/반려
-- =====================================================

-- =====================================================
-- STEP 1: 이행점검항목ID 자동 생성 함수
-- =====================================================

-- 이행점검계획별 순번 생성을 위한 함수
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
    -- 해당 이행점검계획의 첫 번째 항목
    next_seq := '000001';
  ELSE
    -- 기존 순번에서 1 증가
    next_seq := LPAD((max_seq + 1)::TEXT, 6, '0');
  END IF;

  -- 새 ID 생성: impl_inspection_plan_id + "I" + 순번(6자리)
  new_id := p_impl_inspection_plan_id || 'I' || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: impl_inspection_items 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.impl_inspection_items CASCADE;

CREATE TABLE rsms.impl_inspection_items (
  -- ============================================
  -- 기본키
  -- ============================================
  -- 코드 생성 규칙: impl_inspection_plan_id + "I" + 순번(6자리)
  -- 예시: "20250001A0001I000001" = "20250001A0001"(이행점검ID) + "I" + "000001"(순번)
  impl_inspection_item_id VARCHAR(20) PRIMARY KEY,    -- 이행점검항목ID (PK, 업무 코드)

  -- ============================================
  -- 외래키
  -- ============================================
  impl_inspection_plan_id VARCHAR(13) NOT NULL,       -- 이행점검ID (FK → impl_inspection_plans)
  manual_cd VARCHAR(50) NOT NULL,                     -- 부서장업무메뉴얼CD (FK → dept_manager_manuals)

  -- ============================================
  -- 1단계: 점검 정보
  -- ============================================
  inspector_id VARCHAR(50),                           -- 점검자ID
  inspection_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
  inspection_result_content TEXT,                     -- 점검결과내용
  inspection_date DATE,                               -- 점검일자

  -- ============================================
  -- 2단계: 개선이행 정보 (부적정 시에만 사용)
  -- ============================================
  improvement_status_cd VARCHAR(20) NOT NULL DEFAULT '01', -- 개선이행상태코드 (01:개선미이행, 02:개선계획, 03:승인요청, 04:개선이행, 05:개선완료)
  improvement_manager_id VARCHAR(50),                 -- 개선담당자ID (사용자ID : 수행자)
  improvement_plan_content TEXT,                      -- 개선계획내용
  improvement_plan_date DATE,                         -- 개선계획수립일자

   improvement_plan_approved_by VARCHAR(50),          -- 개선계획 승인자ID (결재시스템 연동용)
  improvement_plan_approved_date DATE,                -- 개선계획 승인일자

  improvement_detail_content TEXT,                    -- 개선이행세부내용
  improvement_completed_date DATE,                    -- 개선이행완료일자

  -- ============================================
  -- 3단계: 최종점검(승인) 정보
  -- ============================================
  final_inspection_result_cd VARCHAR(20),             -- 최종점검결과코드 (01:승인, 02:반려)
  final_inspection_result_content TEXT,               -- 최종점검결과내용
  final_inspection_date DATE,                         -- 최종점검일자

  -- ============================================
  -- 최종결과 및 부가 정보
  -- ============================================
  -- 이행점검 최종결과여부 (자동 계산)
  -- - 점검결과상태 = '02'(적정) → 'Y'
  -- - 점검결과상태 = '03'(부적정) AND 최종점검결과 = '01'(승인) → 'Y'
  -- - 그 외 → 'N'
  is_final_completed CHAR(1) GENERATED ALWAYS AS (
    CASE
      WHEN inspection_status_cd = '02' THEN 'Y'  -- 적정 → 완료
      WHEN inspection_status_cd = '03'
           AND final_inspection_result_cd = '01' THEN 'Y'  -- 부적정 → 개선 → 승인 → 완료
      ELSE 'N'
    END
  ) STORED,                                           -- 이행점검 최종결과여부 (Computed Column)

  rejection_count INTEGER DEFAULT 0,                  -- 반려 횟수 (최종점검 반려 횟수)

  -- ============================================
  -- 공통 컬럼 (BaseEntity)
  -- ============================================
  is_active CHAR(1) NOT NULL DEFAULT 'Y',             -- 사용여부 ('Y', 'N')
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  created_by VARCHAR(50) NOT NULL,                    -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                    -- 수정자

  -- ============================================
  -- 제약조건
  -- ============================================
  -- 이행점검항목ID 형식 검증 (8자리 숫자 + A + 4자리 숫자 + I + 6자리 숫자)
  CONSTRAINT chk_impl_inspection_item_id_format CHECK (
    impl_inspection_item_id ~ '^[0-9]{8}A[0-9]{4}I[0-9]{6}$' AND LENGTH(impl_inspection_item_id) = 20
  ),

  -- 점검결과상태코드 검증
  CONSTRAINT chk_inspection_status CHECK (inspection_status_cd IN ('01', '02', '03')),

  -- 개선이행상태코드 검증
  CONSTRAINT chk_improvement_status CHECK (improvement_status_cd IN ('01', '02', '03')),

  -- 최종점검결과코드 검증
  CONSTRAINT chk_final_inspection_result CHECK (final_inspection_result_cd IN ('01', '02')),

  -- 사용여부 검증
  CONSTRAINT chk_impl_inspection_items_is_active CHECK (is_active IN ('Y', 'N')),

  -- 비즈니스 로직 검증: 점검일자는 점검완료 시 필수
  CONSTRAINT chk_inspection_date_required CHECK (
    (inspection_status_cd IN ('02', '03') AND inspection_date IS NOT NULL) OR
    (inspection_status_cd = '01')
  ),

  -- 비즈니스 로직 검증: 개선완료 시 개선완료일자 필수
  CONSTRAINT chk_improvement_completed_date_required CHECK (
    (improvement_status_cd = '03' AND improvement_completed_date IS NOT NULL) OR
    (improvement_status_cd IN ('01', '02'))
  )
);

-- =====================================================
-- STEP 3: 외래키 제약조건 추가
-- =====================================================

-- impl_inspection_plans 테이블 참조
ALTER TABLE rsms.impl_inspection_items
  ADD CONSTRAINT fk_impl_inspection_items_plan
  FOREIGN KEY (impl_inspection_plan_id)
  REFERENCES rsms.impl_inspection_plans(impl_inspection_plan_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- dept_manager_manuals 테이블 참조
ALTER TABLE rsms.impl_inspection_items
  ADD CONSTRAINT fk_impl_inspection_items_manual
  FOREIGN KEY (manual_cd)
  REFERENCES rsms.dept_manager_manuals(manual_cd)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- =====================================================
-- STEP 4: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 이행점검ID 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_impl_inspection_items_plan_id
  ON rsms.impl_inspection_items(impl_inspection_plan_id);

-- 부서장업무메뉴얼CD 인덱스
CREATE INDEX idx_impl_inspection_items_manual_cd
  ON rsms.impl_inspection_items(manual_cd);

-- 점검자ID 인덱스
CREATE INDEX idx_impl_inspection_items_inspector
  ON rsms.impl_inspection_items(inspector_id);

-- 개선담당자ID 인덱스
CREATE INDEX idx_impl_inspection_items_improvement_mgr
  ON rsms.impl_inspection_items(improvement_manager_id);

-- 개선계획 승인자ID 인덱스
CREATE INDEX idx_impl_inspection_items_plan_approved_by
  ON rsms.impl_inspection_items(improvement_plan_approved_by);

-- 점검결과상태코드 인덱스
CREATE INDEX idx_impl_inspection_items_insp_status
  ON rsms.impl_inspection_items(inspection_status_cd);

-- 개선이행상태코드 인덱스
CREATE INDEX idx_impl_inspection_items_improv_status
  ON rsms.impl_inspection_items(improvement_status_cd);

-- 최종점검결과코드 인덱스
CREATE INDEX idx_impl_inspection_items_final_result
  ON rsms.impl_inspection_items(final_inspection_result_cd);

-- 최종결과여부 인덱스
CREATE INDEX idx_impl_inspection_items_final_completed
  ON rsms.impl_inspection_items(is_final_completed);

-- 사용여부 인덱스
CREATE INDEX idx_impl_inspection_items_is_active
  ON rsms.impl_inspection_items(is_active);

-- 복합 인덱스: 이행점검ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_impl_inspection_items_plan_active
  ON rsms.impl_inspection_items(impl_inspection_plan_id, is_active);

-- 복합 인덱스: 점검결과상태 + 사용여부
CREATE INDEX idx_impl_inspection_items_insp_status_active
  ON rsms.impl_inspection_items(inspection_status_cd, is_active);

-- 복합 인덱스: 개선이행상태 + 사용여부
CREATE INDEX idx_impl_inspection_items_improv_status_active
  ON rsms.impl_inspection_items(improvement_status_cd, is_active);

-- 복합 인덱스: 최종결과여부 + 사용여부 (통계용)
CREATE INDEX idx_impl_inspection_items_final_active
  ON rsms.impl_inspection_items(is_final_completed, is_active);

-- =====================================================
-- STEP 5: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.impl_inspection_items IS '이행점검항목 테이블 - 이행점검계획별 점검항목 정보 및 진행상태 관리 (코드 체계: 이행점검ID+I+순번)';

-- 컬럼 코멘트 (기본키/외래키)
COMMENT ON COLUMN rsms.impl_inspection_items.impl_inspection_item_id IS '이행점검항목ID (PK, 업무코드 - 형식: 이행점검ID + I + 순번6자리, 예: 20250001A0001I000001)';
COMMENT ON COLUMN rsms.impl_inspection_items.impl_inspection_plan_id IS '이행점검ID (FK → impl_inspection_plans.impl_inspection_plan_id)';
COMMENT ON COLUMN rsms.impl_inspection_items.manual_cd IS '부서장업무메뉴얼CD (FK → dept_manager_manuals.manual_cd)';

-- 1단계: 점검 정보
COMMENT ON COLUMN rsms.impl_inspection_items.inspector_id IS '점검자ID (최초 점검자 및 최종 점검자 겸임)';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_status_cd IS '점검결과상태코드 (01:미점검, 02:적정, 03:부적정) - common_code_details 참조';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_result_content IS '점검결과내용';
COMMENT ON COLUMN rsms.impl_inspection_items.inspection_date IS '점검일자';

-- 2단계: 개선이행 정보
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_status_cd IS '개선이행상태코드 (01:개선미이행, 02:개선이행진행중, 03:개선이행완료) - common_code_details 참조';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_manager_id IS '개선담당자ID (사용자ID)';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_content IS '개선계획내용';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_date IS '개선계획수립일자';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_detail_content IS '개선이행세부내용';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_completed_date IS '개선완료일자';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_approved_by IS '개선계획 승인자ID (결재시스템 연동용 - 점검자 또는 별도 승인자)';
COMMENT ON COLUMN rsms.impl_inspection_items.improvement_plan_approved_date IS '개선계획 승인일자';

-- 3단계: 최종점검 정보
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_result_cd IS '최종점검결과코드 (01:승인, 02:반려) - common_code_details 참조';
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_result_content IS '최종점검결과내용';
COMMENT ON COLUMN rsms.impl_inspection_items.final_inspection_date IS '최종점검일자';

-- 최종결과 및 부가 정보
COMMENT ON COLUMN rsms.impl_inspection_items.is_final_completed IS '이행점검 최종결과여부 (Y: 완료, N: 미완료) - 자동 계산 (적정 또는 개선승인 시 Y)';
COMMENT ON COLUMN rsms.impl_inspection_items.rejection_count IS '반려 횟수 (최종점검 반려된 횟수)';

-- 공통 컬럼
COMMENT ON COLUMN rsms.impl_inspection_items.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.impl_inspection_items.created_at IS '생성일시';
COMMENT ON COLUMN rsms.impl_inspection_items.created_by IS '생성자';
COMMENT ON COLUMN rsms.impl_inspection_items.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.impl_inspection_items.updated_by IS '수정자';

-- =====================================================
-- STEP 6: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_impl_inspection_items_updated_at
  BEFORE UPDATE ON rsms.impl_inspection_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 7: 트리거 생성 (반려 횟수 자동 증가)
-- =====================================================

-- 최종점검 반려 시 rejection_count 자동 증가
CREATE OR REPLACE FUNCTION rsms.increment_rejection_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 최종점검결과가 '02'(반려)로 변경되면 반려 횟수 증가
  IF NEW.final_inspection_result_cd = '02' AND
     (OLD.final_inspection_result_cd IS NULL OR OLD.final_inspection_result_cd != '02') THEN
    NEW.rejection_count := COALESCE(OLD.rejection_count, 0) + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_rejection_count
  BEFORE UPDATE ON rsms.impl_inspection_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.increment_rejection_count();

-- =====================================================
-- STEP 8: 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- impl_inspection_plans 및 dept_manager_manuals 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.impl_inspection_items (
  impl_inspection_item_id,
  impl_inspection_plan_id,
  manual_cd,
  inspector_id,
  inspection_status_cd,
  inspection_result_content,
  inspection_date,
  improvement_status_cd,
  improvement_manager_id,
  improvement_plan_content,
  improvement_plan_date,
  improvement_detail_content,
  improvement_completed_date,
  final_inspector_id,
  final_inspection_result_cd,
  final_inspection_result_content,
  final_inspection_date,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 샘플 1: 적정 판정 (개선 단계 없음)
  (
    '20250001A0001I000001',
    '20250001A0001',
    '20250001R0001D0001O0001A0001',
    'inspector001',
    '02',  -- 적정
    '점검 결과 문제 없음',
    '2025-01-15',
    '01',  -- 개선미이행 (적정이므로 개선 불필요)
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Y',
    'system',
    'system'
  ),
  -- 샘플 2: 부적정 → 개선중
  (
    '20250001A0001I000002',
    '20250001A0001',
    '20250001R0001D0001O0001A0002',
    'inspector001',
    '03',  -- 부적정
    '개선 필요: 증빙자료 미흡',
    '2025-01-16',
    '02',  -- 개선이행진행중
    'manager001',
    '증빙자료 재작성 및 보완',
    '2025-01-17',
    '증빙자료 보완 작업 진행 중',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Y',
    'system',
    'system'
  ),
  -- 샘플 3: 부적정 → 개선완료 → 승인
  (
    '20250001A0001I000003',
    '20250001A0001',
    '20250001R0001D0001O0001A0003',
    'inspector002',
    '03',  -- 부적정
    '개선 필요: 프로세스 미준수',
    '2025-01-18',
    '03',  -- 개선이행완료
    'manager002',
    '프로세스 개선 및 재교육 실시',
    '2025-01-19',
    '전 직원 대상 프로세스 재교육 완료, 체크리스트 정비 완료',
    '2025-01-25',
    'final_inspector001',
    '01',  -- 승인
    '개선 내용 적절함. 승인',
    '2025-01-26',
    'Y',
    'system',
    'system'
  ),
  -- 샘플 4: 부적정 → 개선완료 → 반려 (1회)
  (
    '20250001A0001I000004',
    '20250001A0001',
    '20250001R0001D0001O0001A0004',
    'inspector002',
    '03',  -- 부적정
    '개선 필요: 리스크 평가 부족',
    '2025-01-20',
    '02',  -- 개선이행진행중 (반려 후 재작업 중)
    'manager003',
    '리스크 평가 보완',
    '2025-01-21',
    '리스크 평가 재작성 중',
    NULL,
    'final_inspector001',
    '02',  -- 반려
    '리스크 평가 내용 불충분. 재작업 필요',
    '2025-01-27',
    'Y',
    'system',
    'system'
  );
*/

-- =====================================================
-- STEP 9: 이행점검항목ID 생성 예시 및 설명
-- =====================================================
-- Backend에서 코드를 자동 생성하는 로직:
--
-- 예시 1) 이행점검계획 "20250001A0001"의 첫 번째 항목 생성:
--   → rsms.generate_impl_inspection_item_id('20250001A0001') 함수 호출
--   → 반환값: "20250001A0001I000001"
--
-- 예시 2) 이행점검계획 "20250001A0001"의 두 번째 항목 생성:
--   → rsms.generate_impl_inspection_item_id('20250001A0001') 함수 호출
--   → 반환값: "20250001A0001I000002"
--
-- Java/Spring Boot 예시:
--   @PrePersist
--   public void prePersist() {
--     if (this.implInspectionItemId == null) {
--       String generatedId = jdbcTemplate.queryForObject(
--         "SELECT rsms.generate_impl_inspection_item_id(?)",
--         String.class,
--         this.implInspectionPlanId
--       );
--       this.implInspectionItemId = generatedId;
--     }
--   }
-- =====================================================

-- =====================================================
-- 권한 설정
-- =====================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.impl_inspection_items TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
