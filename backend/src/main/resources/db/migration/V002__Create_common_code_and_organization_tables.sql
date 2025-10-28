-- =====================================================================================
-- V002: 공통코드 및 조직 테이블 생성
-- =====================================================================================
-- 설명:
--   - common_code_groups: 공통코드 그룹 테이블
--   - common_code_details: 공통코드 상세 테이블  
--   - organizations: 조직 테이블
-- 작성일: 2025-10-28
-- Flyway 마이그레이션: V002
-- 참조: database/scripts/01~03
-- =====================================================================================



-- =====================================================
-- 공통코드 그룹 테이블 (common_code_groups)
-- =====================================================
-- 설명: 시스템 전반에서 사용하는 공통코드의 그룹을 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-09-24
-- 참조: CodeMgmt.tsx - CodeGroup 인터페이스 기반
-- =====================================================

-- DROP TABLE IF EXISTS rsms.common_code_groups CASCADE;

CREATE TABLE rsms.common_code_groups (
  -- 기본키
  group_code VARCHAR(50) PRIMARY KEY,                   -- 그룹코드 (예: 'CD_DVCD', 'AUTH_EXT_TYCD')

  -- 기본 정보
  group_name VARCHAR(200) NOT NULL,                     -- 그룹코드명 (예: '코드 구분코드', '확장 권한 유형코드')
  description VARCHAR(500) NULL,                        -- 설명

  -- 분류 정보
  category VARCHAR(50) NOT NULL DEFAULT '시스템 공통',  -- 구분 ('시스템 공통', '미선택', '책무구조')
  category_code VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',  -- 카테고리 코드 (SYSTEM, BUSINESS, COMMON)

  -- 시스템 속성
  system_code BOOLEAN NOT NULL DEFAULT false,           -- 시스템 코드 여부 (시스템 필수 코드는 true)
  editable BOOLEAN NOT NULL DEFAULT true,               -- 수정 가능 여부 (시스템 코드는 false)
  sort_order INTEGER NOT NULL DEFAULT 0,                -- 정렬 순서

  -- 사용 여부
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',            -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                     -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                     -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 제약조건
  CONSTRAINT chk_ccg_category CHECK (category IN ('시스템 공통', '미선택', '책무구조')),
  CONSTRAINT chk_ccg_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_ccg_sort_order CHECK (sort_order >= 0)
);

-- 인덱스 생성
CREATE INDEX idx_ccg_category ON rsms.common_code_groups(category);
CREATE INDEX idx_ccg_category_code ON rsms.common_code_groups(category_code);
CREATE INDEX idx_ccg_is_active ON rsms.common_code_groups(is_active);
CREATE INDEX idx_ccg_sort_order ON rsms.common_code_groups(sort_order);
CREATE INDEX idx_ccg_system_code ON rsms.common_code_groups(system_code);

-- 코멘트 추가
COMMENT ON TABLE rsms.common_code_groups IS '공통코드 그룹 테이블 - 시스템 전반에서 사용하는 공통코드의 그룹을 관리';
COMMENT ON COLUMN rsms.common_code_groups.group_code IS '그룹코드 (PK)';
COMMENT ON COLUMN rsms.common_code_groups.group_name IS '그룹코드명';
COMMENT ON COLUMN rsms.common_code_groups.description IS '그룹 설명';
COMMENT ON COLUMN rsms.common_code_groups.category IS '구분 (시스템 공통, 미선택, 책무구조)';
COMMENT ON COLUMN rsms.common_code_groups.category_code IS '카테고리 코드 (SYSTEM, BUSINESS, COMMON)';
COMMENT ON COLUMN rsms.common_code_groups.system_code IS '시스템 코드 여부 (시스템 필수 코드는 true)';
COMMENT ON COLUMN rsms.common_code_groups.editable IS '수정 가능 여부 (시스템 코드는 false)';
COMMENT ON COLUMN rsms.common_code_groups.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.common_code_groups.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.common_code_groups.created_by IS '생성자';
COMMENT ON COLUMN rsms.common_code_groups.created_at IS '생성일시';
COMMENT ON COLUMN rsms.common_code_groups.updated_by IS '수정자';
COMMENT ON COLUMN rsms.common_code_groups.updated_at IS '수정일시';

-- =====================================================
-- 공통코드 상세 테이블 (common_code_details)
-- =====================================================
-- 설명: 공통코드 그룹에 속한 상세 코드를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-09-24
-- 참조: CodeMgmt.tsx - CodeDetail 인터페이스 기반
-- =====================================================

-- DROP TABLE IF EXISTS rsms.common_code_details CASCADE;

CREATE TABLE rsms.common_code_details (
  -- 복합 기본키
  group_code VARCHAR(50) NOT NULL,                      -- 그룹코드 (FK)
  detail_code VARCHAR(50) NOT NULL,                     -- 상세코드 (예: '0000', '1002', '1010')

  -- 기본 정보
  detail_name VARCHAR(200) NOT NULL,                    -- 상세코드명 (예: '이사회 운영위원회 관련업무 책무')
  description VARCHAR(500) NULL,                        -- 설명

  -- 계층 구조 정보
  parent_code VARCHAR(50) NULL,                         -- 부모 코드 (계층 구조 지원)
  level_depth INTEGER NOT NULL DEFAULT 1,               -- 레벨 깊이 (1부터 시작)
  sort_order INTEGER NOT NULL DEFAULT 0,                -- 정렬 순서

  -- 확장 속성 (유연한 확장을 위한 범용 필드)
  ext_attr1 VARCHAR(200) NULL,                          -- 확장 속성1
  ext_attr2 VARCHAR(200) NULL,                          -- 확장 속성2
  ext_attr3 VARCHAR(200) NULL,                          -- 확장 속성3
  extra_data JSONB NULL,                                -- 추가 데이터 (JSON 형식)

  -- 유효 기간
  valid_from DATE NULL,                                 -- 유효 시작일
  valid_until DATE NULL,                                -- 유효 종료일

  -- 사용 여부
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',            -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                     -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                     -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 기본키 및 외래키 제약조건
  CONSTRAINT pk_ccd PRIMARY KEY (group_code, detail_code),
  CONSTRAINT fk_ccd_group_code FOREIGN KEY (group_code)
    REFERENCES rsms.common_code_groups(group_code)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 제약조건
  CONSTRAINT chk_ccd_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_ccd_level_depth CHECK (level_depth > 0),
  CONSTRAINT chk_ccd_sort_order CHECK (sort_order >= 0),
  CONSTRAINT chk_ccd_valid_period CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from <= valid_until)
);

-- 인덱스 생성
CREATE INDEX idx_ccd_group_code ON rsms.common_code_details(group_code);
CREATE INDEX idx_ccd_detail_code ON rsms.common_code_details(detail_code);
CREATE INDEX idx_ccd_parent_code ON rsms.common_code_details(parent_code);
CREATE INDEX idx_ccd_is_active ON rsms.common_code_details(is_active);
CREATE INDEX idx_ccd_sort_order ON rsms.common_code_details(sort_order);
CREATE INDEX idx_ccd_level_depth ON rsms.common_code_details(level_depth);
CREATE INDEX idx_ccd_valid_period ON rsms.common_code_details(valid_from, valid_until);

-- JSONB 인덱스 (extra_data에 대한 GIN 인덱스)
CREATE INDEX idx_ccd_extra_data ON rsms.common_code_details USING GIN (extra_data);

-- 코멘트 추가
COMMENT ON TABLE rsms.common_code_details IS '공통코드 상세 테이블 - 공통코드 그룹에 속한 상세 코드를 관리';
COMMENT ON COLUMN rsms.common_code_details.group_code IS '그룹코드 (FK, PK)';
COMMENT ON COLUMN rsms.common_code_details.detail_code IS '상세코드 (PK)';
COMMENT ON COLUMN rsms.common_code_details.detail_name IS '상세코드명';
COMMENT ON COLUMN rsms.common_code_details.description IS '상세 설명';
COMMENT ON COLUMN rsms.common_code_details.parent_code IS '부모 코드 (계층 구조 지원)';
COMMENT ON COLUMN rsms.common_code_details.level_depth IS '레벨 깊이 (1부터 시작)';
COMMENT ON COLUMN rsms.common_code_details.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.common_code_details.ext_attr1 IS '확장 속성1';
COMMENT ON COLUMN rsms.common_code_details.ext_attr2 IS '확장 속성2';
COMMENT ON COLUMN rsms.common_code_details.ext_attr3 IS '확장 속성3';
COMMENT ON COLUMN rsms.common_code_details.extra_data IS '추가 데이터 (JSON 형식)';
COMMENT ON COLUMN rsms.common_code_details.valid_from IS '유효 시작일';
COMMENT ON COLUMN rsms.common_code_details.valid_until IS '유효 종료일';
COMMENT ON COLUMN rsms.common_code_details.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.common_code_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.common_code_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.common_code_details.updated_by IS '수정자';
COMMENT ON COLUMN rsms.common_code_details.updated_at IS '수정일시';

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
