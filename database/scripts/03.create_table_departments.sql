
-- =====================================================
-- 부서 테이블 (departments)
-- =====================================================
-- 설명: 조직의 부서(부점) 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-09-24
-- 참고:
--   - 부서는 본부 소속이며, 부점이라고도 불림
--   - 본부코드는 common_code_details에서 group_code='DPRM_CD'로 관리
--     예: '1010' 경영전략본부, '1011' 리스크관리본부, '1017' 디지털IT본부
-- =====================================================

-- DROP TABLE IF EXISTS rsms.departments CASCADE;

CREATE TABLE rsms.departments (
  -- 기본키
  dept_code VARCHAR(20) PRIMARY KEY,                    -- 부서코드 (PK, 부점코드)

  -- 외래키
  hq_code VARCHAR(20) NOT NULL,                         -- 본부코드 (FK)

  -- 기본 정보
  dept_name VARCHAR(100) NOT NULL,                      -- 부서명 (부점명)

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',            -- 사용여부 ('Y', 'N')
  is_branch_office VARCHAR(1) NOT NULL DEFAULT 'N',     -- 출장소여부 ('Y', 'N')
  is_closed VARCHAR(1) NOT NULL DEFAULT 'N',            -- 폐쇄여부 ('Y', 'N')
  closed_date VARCHAR(8) NULL,                          -- 폐쇄일자 (YYYYMMDD)

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                     -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                     -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 참고: 본부코드는 common_code_details의 DPRM_CD 그룹에서 관리
  -- FK 제약조건은 걸지 않음 (group_code 변경 가능성 및 복합키 문제)
  -- 애플리케이션 레벨에서 검증 필요

  -- 제약조건
  CONSTRAINT chk_departments_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_departments_is_branch_office CHECK (is_branch_office IN ('Y', 'N')),
  CONSTRAINT chk_departments_is_closed CHECK (is_closed IN ('Y', 'N')),
  CONSTRAINT chk_departments_closed_date CHECK (
    closed_date IS NULL OR
    (closed_date ~ '^[0-9]{8}$' AND LENGTH(closed_date) = 8)
  )
);

-- 인덱스 생성
CREATE INDEX idx_departments_hq_code ON rsms.departments(hq_code);
CREATE INDEX idx_departments_is_active ON rsms.departments(is_active);
CREATE INDEX idx_departments_is_branch_office ON rsms.departments(is_branch_office);
CREATE INDEX idx_departments_is_closed ON rsms.departments(is_closed);
CREATE INDEX idx_departments_closed_date ON rsms.departments(closed_date);
CREATE INDEX idx_departments_name ON rsms.departments(dept_name);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_departments_hq_active ON rsms.departments(hq_code, is_active);
CREATE INDEX idx_departments_active_closed ON rsms.departments(is_active, is_closed);

-- 코멘트 추가
COMMENT ON TABLE rsms.departments IS '부서 테이블 - 조직의 부서(부점) 정보를 관리';
COMMENT ON COLUMN rsms.departments.dept_code IS '부서코드 (PK, 부점코드)';
COMMENT ON COLUMN rsms.departments.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조, 애플리케이션 레벨 검증)';
COMMENT ON COLUMN rsms.departments.dept_name IS '부서명 (부점명)';
COMMENT ON COLUMN rsms.departments.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.departments.is_branch_office IS '출장소여부 (Y: 출장소, N: 일반부서)';
COMMENT ON COLUMN rsms.departments.is_closed IS '폐쇄여부 (Y: 폐쇄, N: 운영중)';
COMMENT ON COLUMN rsms.departments.closed_date IS '폐쇄일자 (YYYYMMDD 형식)';
COMMENT ON COLUMN rsms.departments.created_by IS '생성자';
COMMENT ON COLUMN rsms.departments.created_at IS '생성일시';
COMMENT ON COLUMN rsms.departments.updated_by IS '수정자';
COMMENT ON COLUMN rsms.departments.updated_at IS '수정일시';

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: 본부코드는 common_code_details의 DPRM_CD 그룹에 미리 등록되어 있어야 함
/*
INSERT INTO rsms.departments (dept_code, hq_code, dept_name, is_active, is_branch_office, is_closed, created_by, updated_by) VALUES
  ('DEPT001', '1010', '서울경영전략부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT002', '1010', '부산경영전략부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT003', '1011', '대구리스크관리지점', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT004', '1011', '인천리스크관리출장소', 'Y', 'Y', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT005', '1017', '광주디지털IT지점', 'N', 'N', 'Y', 'SYSTEM', 'SYSTEM');
*/
