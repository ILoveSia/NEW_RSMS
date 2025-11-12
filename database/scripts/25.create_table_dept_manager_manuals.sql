
-- =====================================================
-- 부서장업무메뉴얼 테이블 (dept_manager_manuals) 생성
-- =====================================================
-- 설명: 부서장업무 관련 관리활동 등록 및 관리
-- 작성자: Claude AI
-- 작성일: 2025-11-07
-- 참고:
--   - ledger_order 테이블과 N:1 관계 (ledger_order_id FK)
--   - organizations 테이블과 N:1 관계 (org_code FK)
--   - common_code_details 테이블의 여러 그룹코드 참조
--     * MGMT_OBLG_LCCD: 관리활동구분코드
--     * ACVT_RSK_EVAL_DVCD: 위험평가등급
--     * ACVT_FRCD: 관리활동수행주기
--     * ACVT_EVDN_TYP_DVCD: 관리활동증빙유형코드
--     * FLFL_ISPC_FRCD: 이행점검주기
-- =====================================================

-- =====================================================
-- STEP 1: dept_manager_manuals 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.dept_manager_manuals CASCADE;

CREATE TABLE rsms.dept_manager_manuals (
  -- 기본키
  manual_id BIGSERIAL PRIMARY KEY,                     -- 부서장업무메뉴얼ID (기본키)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)
  obligation_cd VARCHAR(50) NOT NULL,                  -- 관리의무코드
  org_code VARCHAR(20) NOT NULL,                       -- 조직코드 (FK → organizations)

  -- 관리활동 기본정보
  activity_type_cd VARCHAR(20) NOT NULL,               -- 관리활동구분코드 (MGMT_OBLG_LCCD: 고유, 공통)
  activity_name VARCHAR(200) NOT NULL,                 -- 관리활동명
  activity_detail TEXT,                                -- 관리활동상세
  risk_assessment_level_cd VARCHAR(20) NOT NULL,       -- 위험평가등급 (ACVT_RSK_EVAL_DVCD: 상, 중, 하)
  activity_frequency_cd VARCHAR(20),                   -- 관리활동수행주기 (ACVT_FRCD)
  evidence_type_cd VARCHAR(20),                        -- 관리활동증빙유형코드 (ACVT_EVDN_TYP_DVCD)
  evidence_material TEXT,                              -- 관리활동증빙자료
  related_basis TEXT,                                  -- 관련근거

  -- 이행점검 정보
  impl_check_frequency_cd VARCHAR(20),                 -- 이행점검주기 (FLFL_ISPC_FRCD)
  is_conditional_check CHAR(1) DEFAULT 'N',            -- 조건부점검항목여부 (Y/N)
  impl_check_method VARCHAR(500),                      -- 이행점검방법
  impl_check_detail TEXT,                              -- 이행점검세부내용
  end_date DATE,                                       -- 종료일

  -- 상태 관리
  is_active CHAR(1) DEFAULT 'Y',                       -- 사용여부 (Y/N)
  status VARCHAR(20) DEFAULT 'active',                 -- 상태 (active: 사용, inactive: 미사용, pending: 검토중, approved: 승인완료)

  -- 수행 정보
  executor_id VARCHAR(50),                             -- 수행자ID
  execution_date DATE,                                 -- 수행일자
  execution_status VARCHAR(20),                        -- 수행여부 (01:미수행, 02:수행완료)
  execution_result_cd VARCHAR(20),                     -- 수행결과코드 (01:적정, 02:부적정)
  execution_result_content TEXT,                       -- 수행결과내용

  -- 감사 필드 (BaseEntity 패턴)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 등록일시
  created_by VARCHAR(50) NOT NULL,                     -- 등록자
  updated_at TIMESTAMP,                                -- 수정일시
  updated_by VARCHAR(50),                              -- 수정자
  approved_at TIMESTAMP,                               -- 승인일시
  approved_by VARCHAR(50),                             -- 승인자

  -- 비고
  remarks TEXT,                                        -- 비고

  -- 제약조건: 조건부점검항목여부는 Y 또는 N만 가능
  CONSTRAINT chk_is_conditional_check CHECK (is_conditional_check IN ('Y', 'N')),

  -- 제약조건: 사용여부는 Y 또는 N만 가능
  CONSTRAINT chk_is_active CHECK (is_active IN ('Y', 'N')),

  -- 제약조건: 상태는 정해진 값만 가능
  CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'pending', 'approved')),

  -- 제약조건: 수행여부는 정해진 값만 가능
  CONSTRAINT chk_execution_status CHECK (execution_status IN ('01', '02')),

  -- 제약조건: 수행결과코드는 정해진 값만 가능
  CONSTRAINT chk_execution_result_cd CHECK (execution_result_cd IN ('01', '02'))
);

-- =====================================================
-- STEP 2: 외래키 제약조건 추가
-- =====================================================

-- ledger_order 테이블 참조
ALTER TABLE rsms.dept_manager_manuals
  ADD CONSTRAINT fk_dept_manager_manuals_ledger_order
  FOREIGN KEY (ledger_order_id)
  REFERENCES rsms.ledger_order(ledger_order_id)
  ON DELETE RESTRICT;

-- organizations 테이블 참조
ALTER TABLE rsms.dept_manager_manuals
  ADD CONSTRAINT fk_dept_manager_manuals_org
  FOREIGN KEY (org_code)
  REFERENCES rsms.organizations(org_code)
  ON DELETE RESTRICT;

-- =====================================================
-- STEP 3: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 원장차수ID 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_dept_manager_manuals_ledger_order
  ON rsms.dept_manager_manuals(ledger_order_id);

-- 조직코드 인덱스 (조회 성능 향상)
CREATE INDEX idx_dept_manager_manuals_org_code
  ON rsms.dept_manager_manuals(org_code);

-- 관리의무코드 인덱스 (검색 시 사용)
CREATE INDEX idx_dept_manager_manuals_obligation
  ON rsms.dept_manager_manuals(obligation_cd);

-- 상태 복합 인덱스 (필터링 시 자주 사용)
CREATE INDEX idx_dept_manager_manuals_status
  ON rsms.dept_manager_manuals(is_active, status);

-- 위험평가등급 인덱스 (통계 및 필터링 시 사용)
CREATE INDEX idx_dept_manager_manuals_risk_level
  ON rsms.dept_manager_manuals(risk_assessment_level_cd);

-- 등록일시 인덱스 (최근 등록 조회 시 사용)
CREATE INDEX idx_dept_manager_manuals_created_at
  ON rsms.dept_manager_manuals(created_at DESC);

-- 수행여부 인덱스 (수행 상태 필터링 시 사용)
CREATE INDEX idx_dept_manager_manuals_execution_status
  ON rsms.dept_manager_manuals(execution_status);

-- 수행자ID 인덱스 (수행자별 조회 시 사용)
CREATE INDEX idx_dept_manager_manuals_executor_id
  ON rsms.dept_manager_manuals(executor_id);

-- =====================================================
-- STEP 4: 테이블 및 컬럼 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.dept_manager_manuals IS '부서장업무메뉴얼 관리 테이블 - 부서장업무 관련 관리활동 등록 및 이행점검 관리';

-- 기본키 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.manual_id IS '부서장업무메뉴얼ID (기본키)';

-- 외래키 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.dept_manager_manuals.obligation_cd IS '관리의무코드';
COMMENT ON COLUMN rsms.dept_manager_manuals.org_code IS '조직코드 (FK → organizations)';

-- 관리활동 기본정보 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.activity_type_cd IS '관리활동구분코드 (MGMT_OBLG_LCCD: 고유, 공통)';
COMMENT ON COLUMN rsms.dept_manager_manuals.activity_name IS '관리활동명';
COMMENT ON COLUMN rsms.dept_manager_manuals.activity_detail IS '관리활동상세';
COMMENT ON COLUMN rsms.dept_manager_manuals.risk_assessment_level_cd IS '위험평가등급 (ACVT_RSK_EVAL_DVCD: 상, 중, 하)';
COMMENT ON COLUMN rsms.dept_manager_manuals.activity_frequency_cd IS '관리활동수행주기 (ACVT_FRCD)';
COMMENT ON COLUMN rsms.dept_manager_manuals.evidence_type_cd IS '관리활동증빙유형코드 (ACVT_EVDN_TYP_DVCD)';
COMMENT ON COLUMN rsms.dept_manager_manuals.evidence_material IS '관리활동증빙자료';
COMMENT ON COLUMN rsms.dept_manager_manuals.related_basis IS '관련근거';

-- 이행점검 정보 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.impl_check_frequency_cd IS '이행점검주기 (FLFL_ISPC_FRCD)';
COMMENT ON COLUMN rsms.dept_manager_manuals.is_conditional_check IS '조건부점검항목여부 (Y/N)';
COMMENT ON COLUMN rsms.dept_manager_manuals.impl_check_method IS '이행점검방법';
COMMENT ON COLUMN rsms.dept_manager_manuals.impl_check_detail IS '이행점검세부내용';
COMMENT ON COLUMN rsms.dept_manager_manuals.end_date IS '종료일';

-- 상태 관리 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.dept_manager_manuals.status IS '상태 (active: 사용, inactive: 미사용, pending: 검토중, approved: 승인완료)';

-- 수행 정보 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.executor_id IS '수행자ID';
COMMENT ON COLUMN rsms.dept_manager_manuals.execution_date IS '수행일자';
COMMENT ON COLUMN rsms.dept_manager_manuals.execution_status IS '수행여부 (01: 미수행, 02: 수행완료)';
COMMENT ON COLUMN rsms.dept_manager_manuals.execution_result_cd IS '수행결과코드 (01: 적정, 02: 부적정)';
COMMENT ON COLUMN rsms.dept_manager_manuals.execution_result_content IS '수행결과내용';

-- 감사 필드 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.created_at IS '등록일시';
COMMENT ON COLUMN rsms.dept_manager_manuals.created_by IS '등록자';
COMMENT ON COLUMN rsms.dept_manager_manuals.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.dept_manager_manuals.updated_by IS '수정자';
COMMENT ON COLUMN rsms.dept_manager_manuals.approved_at IS '승인일시';
COMMENT ON COLUMN rsms.dept_manager_manuals.approved_by IS '승인자';

-- 비고 코멘트
COMMENT ON COLUMN rsms.dept_manager_manuals.remarks IS '비고';

-- =====================================================
-- STEP 5: 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ dept_manager_manuals 테이블 생성 완료';
  RAISE NOTICE '✅ 외래키 제약조건 추가 완료';
  RAISE NOTICE '✅ 인덱스 생성 완료';
  RAISE NOTICE '✅ 테이블 및 컬럼 코멘트 추가 완료';
  RAISE NOTICE '';
  RAISE NOTICE '📋 테이블명: rsms.dept_manager_manuals';
  RAISE NOTICE '📋 설명: 부서장업무메뉴얼 관리 테이블';
  RAISE NOTICE '📋 기본키: manual_id (BIGSERIAL)';
  RAISE NOTICE '📋 외래키: ledger_order_id, org_code';
  RAISE NOTICE '📋 인덱스: 8개 생성 완료 (수행여부, 수행자ID 인덱스 포함)';
END $$;
