
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
  is_active CHAR(1) NOT NULL DEFAULT 'Y',               -- 사용여부 ('Y', 'N')

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
