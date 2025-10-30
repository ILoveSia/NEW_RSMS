-- =====================================================================================
-- 08. management_obligations 테이블 생성 (관리의무 테이블)
-- =====================================================================================
-- 설명: 책무세부에 대한 관리의무 정보를 관리하는 테이블 (1:N 관계)
-- 작성일: 2025-09-24
-- =====================================================================================

-- 기존 테이블이 존재하면 삭제 (개발 환경에서만 사용, 운영 환경에서는 주석 처리 필요)
DROP TABLE IF EXISTS rsms.management_obligations CASCADE;

-- management_obligations 테이블 생성
CREATE TABLE rsms.management_obligations (
  -- 기본키 (대리키)
  management_obligation_id BIGSERIAL PRIMARY KEY,             -- 관리의무ID (PK, 자동증가)

  -- 외래키
  responsibility_detail_id BIGINT NOT NULL,                   -- 책무세부ID (FK → responsibility_details)

  -- 기본 정보
  obligation_major_cat_cd VARCHAR(20) NOT NULL,               -- 관리의무 대분류 구분코드 (common_code_details 의 MGMT_OBLG_LCCD 그룹 참조)
  obligation_middle_cat_cd VARCHAR(20) NOT NULL,              -- 관리의무 중분류 구분코드 (common_code_details 의 MGMT_OBLG_MCCD 그룹 참조)
  obligation_cd VARCHAR(20) NOT NULL,                         -- 관리의무코드 신규생성
  obligation_info VARCHAR(1000) NOT NULL,                     -- 관리의무내용
  org_code VARCHAR(20) NOT NULL,                              -- 조직코드 (organizations 참조)

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',                  -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_management_obligations_resp_detail FOREIGN KEY (responsibility_detail_id)
    REFERENCES rsms.responsibility_details(responsibility_detail_id) ON DELETE CASCADE,

  -- 외래키 제약조건 (org_code → organizations)
  CONSTRAINT fk_management_obligations_org_code FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code) ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT chk_management_obligations_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================================================
-- 인덱스 생성
-- =====================================================================================
-- 책무세부ID 조회용 인덱스 (가장 자주 사용)
CREATE INDEX idx_mgmt_obligations_resp_detail_id ON rsms.management_obligations(responsibility_detail_id);

-- 관리의무 대분류 구분코드 조회용 인덱스
CREATE INDEX idx_mgmt_obligations_major_cat ON rsms.management_obligations(obligation_major_cat_cd);

-- 관리의무 중분류 구분코드 조회용 인덱스
CREATE INDEX idx_mgmt_obligations_middle_cat ON rsms.management_obligations(obligation_middle_cat_cd);

-- 관리의무코드 조회용 인덱스
CREATE INDEX idx_mgmt_obligations_cd ON rsms.management_obligations(obligation_cd);

-- 조직코드 조회용 인덱스
CREATE INDEX idx_mgmt_obligations_org_code ON rsms.management_obligations(org_code);

-- 사용여부 조회용 인덱스
CREATE INDEX idx_mgmt_obligations_is_active ON rsms.management_obligations(is_active);

-- 복합 인덱스: 책무세부ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_mgmt_obligations_detail_active ON rsms.management_obligations(responsibility_detail_id, is_active);

-- 복합 인덱스: 대분류 + 중분류 (계층 조회용)
CREATE INDEX idx_mgmt_obligations_major_middle ON rsms.management_obligations(obligation_major_cat_cd, obligation_middle_cat_cd);

-- 복합 인덱스: 조직코드 + 사용여부 (조직별 조회용)
CREATE INDEX idx_mgmt_obligations_org_active ON rsms.management_obligations(org_code, is_active);

-- =====================================================================================
-- 코멘트 추가
-- =====================================================================================
-- 테이블 코멘트
COMMENT ON TABLE rsms.management_obligations IS '책무세부에 대한 관리의무 정보를 관리하는 테이블 (1:N 관계)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.management_obligations.management_obligation_id IS '관리의무ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.management_obligations.responsibility_detail_id IS '책무세부ID (FK → responsibility_details)';
COMMENT ON COLUMN rsms.management_obligations.obligation_major_cat_cd IS '관리의무 대분류 구분코드 (common_code_details 참조)';
COMMENT ON COLUMN rsms.management_obligations.obligation_middle_cat_cd IS '관리의무 중분류 구분코드 (common_code_details 참조)';
COMMENT ON COLUMN rsms.management_obligations.obligation_cd IS '관리의무코드 (common_code_details 참조)';
COMMENT ON COLUMN rsms.management_obligations.obligation_info IS '관리의무내용';
COMMENT ON COLUMN rsms.management_obligations.org_code IS '조직코드 (FK → organizations.org_code)';
COMMENT ON COLUMN rsms.management_obligations.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.management_obligations.created_at IS '생성일시';
COMMENT ON COLUMN rsms.management_obligations.created_by IS '생성자';
COMMENT ON COLUMN rsms.management_obligations.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.management_obligations.updated_by IS '수정자';

-- =====================================================================================
-- 트리거 생성 (updated_at 자동 갱신)
-- =====================================================================================
CREATE TRIGGER trigger_management_obligations_updated_at
  BEFORE UPDATE ON rsms.management_obligations
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================================================
-- 외래키 제약조건 검증 쿼리 (선택사항)
-- =====================================================================================
-- 외래키 추가 전 기존 데이터 검증 (잘못된 org_code가 있는지 확인)
-- 이 쿼리가 결과를 반환하면 FK 추가 전에 데이터 정리 필요
/*
SELECT mo.management_obligation_id, mo.org_code, mo.obligation_info
FROM rsms.management_obligations mo
LEFT JOIN rsms.organizations o ON mo.org_code = o.org_code
WHERE o.org_code IS NULL;
*/

-- 외래키 제약조건 확인 쿼리
-- 외래키가 정상적으로 추가되었는지 확인
/*
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name = 'management_obligations'
  AND kcu.column_name = 'org_code';
*/

-- =====================================================================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- responsibility_details 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.management_obligations (
  responsibility_detail_id,
  obligation_major_cat_cd,
  obligation_middle_cat_cd,
  obligation_cd,
  obligation_info,
  org_code,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 리스크 식별 관련 관리의무
  (1, 'RISK_MGT', 'RISK_ID', 'RISK_ID_001', '신용리스크 식별 및 측정', 'ORG_HQ', 'Y', 'system', 'system'),
  (1, 'RISK_MGT', 'RISK_ID', 'RISK_ID_002', '시장리스크 식별 및 측정', 'ORG_HQ', 'Y', 'system', 'system'),
  (1, 'RISK_MGT', 'RISK_ID', 'RISK_ID_003', '운영리스크 식별 및 측정', 'ORG_HQ', 'Y', 'system', 'system'),

  -- 리스크 평가 관련 관리의무
  (2, 'RISK_MGT', 'RISK_EVAL', 'RISK_EVAL_001', '리스크 영향도 평가', 'ORG_DEPT', 'Y', 'system', 'system'),
  (2, 'RISK_MGT', 'RISK_EVAL', 'RISK_EVAL_002', '리스크 발생가능성 평가', 'ORG_DEPT', 'Y', 'system', 'system'),

  -- 통제 활동 설계 관련 관리의무
  (4, 'INTERNAL_CTRL', 'CTRL_DESIGN', 'CTRL_DESIGN_001', '통제 프로세스 설계', 'ORG_HQ', 'Y', 'system', 'system'),
  (4, 'INTERNAL_CTRL', 'CTRL_DESIGN', 'CTRL_DESIGN_002', '통제 절차 문서화', 'ORG_HQ', 'Y', 'system', 'system'),

  -- 준법 모니터링 관련 관리의무
  (7, 'COMPLIANCE', 'COMP_MONITOR', 'COMP_MONITOR_001', '법규 변경사항 모니터링', 'ORG_BRANCH', 'Y', 'system', 'system'),
  (7, 'COMPLIANCE', 'COMP_MONITOR', 'COMP_MONITOR_002', '규정 준수 여부 점검', 'ORG_BRANCH', 'Y', 'system', 'system');
*/

-- =====================================================================================
-- 권한 설정
-- =====================================================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.management_obligations TO rsms_app;
--GRANT USAGE, SELECT ON SEQUENCE rsms.management_obligations_management_obligation_id_seq TO rsms_app;

-- =====================================================================================
-- 스크립트 완료
-- =====================================================================================
