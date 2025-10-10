
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
  is_active CHAR(1) NOT NULL DEFAULT 'Y',               -- 사용여부 ('Y', 'N')

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
