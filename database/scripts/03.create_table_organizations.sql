
-- =====================================================
-- 조직 테이블 (organizations)
-- =====================================================
-- 설명: 본부, 부서, 영업점(지점)을 통합 관리하는 조직 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - org_type: 'head'(본부), 'dept'(부서), 'branch'(영업점/지점)
--   - 본부코드는 common_code_details에서 group_code='DPRM_CD'로 관리
--     예: '1010' 경영전략본부, '1011' 리스크관리본부, '1017' 디지털IT본부
-- =====================================================

-- DROP TABLE IF EXISTS rsms.organizations CASCADE;

CREATE TABLE rsms.organizations (
  -- 기본키
  org_code VARCHAR(20) PRIMARY KEY,                     -- 조직코드 (PK)

  -- 외래키
  hq_code VARCHAR(20) NOT NULL,                         -- 본부코드 (FK)

  -- 조직 구분
  org_type VARCHAR(10) NOT NULL,                        -- 조직유형 ('head': 본부, 'dept': 부서, 'branch': 영업점)

  -- 기본 정보
  org_name VARCHAR(100) NOT NULL,                       -- 조직명

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',            -- 사용여부 ('Y', 'N')
  is_branch_office VARCHAR(1) NOT NULL DEFAULT 'N',     -- 출장소여부 ('Y', 'N')
  is_closed VARCHAR(1) NOT NULL DEFAULT 'N',            -- 폐쇄여부 ('Y', 'N')
  closed_date DATE NULL,                                -- 폐쇄일자

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                     -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                     -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 참고: 본부코드는 common_code_details의 DPRM_CD 그룹에서 관리
  -- FK 제약조건은 걸지 않음 (group_code 변경 가능성 및 복합키 문제)
  -- 애플리케이션 레벨에서 검증 필요

  -- 제약조건
  CONSTRAINT chk_organizations_org_type CHECK (org_type IN ('head', 'dept', 'branch')),
  CONSTRAINT chk_organizations_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_organizations_is_branch_office CHECK (is_branch_office IN ('Y', 'N')),
  CONSTRAINT chk_organizations_is_closed CHECK (is_closed IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_organizations_hq_code ON rsms.organizations(hq_code);
CREATE INDEX idx_organizations_org_type ON rsms.organizations(org_type);
CREATE INDEX idx_organizations_is_active ON rsms.organizations(is_active);
CREATE INDEX idx_organizations_is_branch_office ON rsms.organizations(is_branch_office);
CREATE INDEX idx_organizations_is_closed ON rsms.organizations(is_closed);
CREATE INDEX idx_organizations_closed_date ON rsms.organizations(closed_date);
CREATE INDEX idx_organizations_name ON rsms.organizations(org_name);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_organizations_hq_active ON rsms.organizations(hq_code, is_active);
CREATE INDEX idx_organizations_type_active ON rsms.organizations(org_type, is_active);
CREATE INDEX idx_organizations_active_closed ON rsms.organizations(is_active, is_closed);

-- 코멘트 추가
COMMENT ON TABLE rsms.organizations IS '조직 테이블 - 본부, 부서, 영업점(지점) 정보를 통합 관리';
COMMENT ON COLUMN rsms.organizations.org_code IS '조직코드 (PK)';
COMMENT ON COLUMN rsms.organizations.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조, 애플리케이션 레벨 검증)';
COMMENT ON COLUMN rsms.organizations.org_type IS '조직유형 (head: 본부, dept: 부서, branch: 영업점/지점)';
COMMENT ON COLUMN rsms.organizations.org_name IS '조직명';
COMMENT ON COLUMN rsms.organizations.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.organizations.is_branch_office IS '출장소여부 (Y: 출장소, N: 일반조직)';
COMMENT ON COLUMN rsms.organizations.is_closed IS '폐쇄여부 (Y: 폐쇄, N: 운영중)';
COMMENT ON COLUMN rsms.organizations.closed_date IS '폐쇄일자';
COMMENT ON COLUMN rsms.organizations.created_by IS '생성자';
COMMENT ON COLUMN rsms.organizations.created_at IS '생성일시';
COMMENT ON COLUMN rsms.organizations.updated_by IS '수정자';
COMMENT ON COLUMN rsms.organizations.updated_at IS '수정일시';

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: 본부코드는 common_code_details의 DPRM_CD 그룹에 미리 등록되어 있어야 함
/*
INSERT INTO rsms.organizations (org_code, hq_code, org_type, org_name, is_active, is_branch_office, is_closed, created_by, updated_by) VALUES
  -- 본부 (head)
  ('HEAD1010', '1010', 'head', '경영전략본부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('HEAD1011', '1011', 'head', '리스크관리본부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('HEAD1017', '1017', 'head', '디지털IT본부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),

  -- 부서 (dept)
  ('DEPT001', '1010', 'dept', '서울경영전략부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT002', '1010', 'dept', '부산경영전략부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('DEPT003', '1011', 'dept', '대구리스크관리부', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),

  -- 영업점 (branch)
  ('BRANCH001', '1010', 'branch', '강남영업점', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('BRANCH002', '1010', 'branch', '서초영업점', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('BRANCH003', '1011', 'branch', '분당지점', 'Y', 'N', 'N', 'SYSTEM', 'SYSTEM'),
  ('BRANCH004', '1017', 'branch', '판교출장소', 'Y', 'Y', 'N', 'SYSTEM', 'SYSTEM'),

  -- 폐쇄된 조직 예시
  ('BRANCH005', '1017', 'branch', '광주지점', 'N', 'N', 'Y', 'SYSTEM', 'SYSTEM');
*/
