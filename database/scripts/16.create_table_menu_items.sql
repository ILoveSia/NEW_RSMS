
-- =====================================================
-- 메뉴 테이블 (menu_items)
-- =====================================================
-- 설명: 시스템 메뉴 계층 구조 (MenuMgmt UI 트리)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - MenuMgmt UI 왼쪽 트리 구조 데이터
--   - Self-reference로 계층 구조 구현
--   - 메뉴 타입: folder(폴더), page(페이지), link(외부 링크)
--   - 메뉴 깊이: 1(대메뉴), 2(중메뉴), 3(소메뉴)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.menu_items CASCADE;

CREATE TABLE rsms.menu_items (
  -- 기본키
  menu_id BIGSERIAL PRIMARY KEY,                       -- 메뉴ID (PK, 자동증가)

  -- 메뉴 기본 정보
  menu_code VARCHAR(20) NOT NULL UNIQUE,               -- 메뉴 코드 (예: 01, 0101, 0802)
  menu_name VARCHAR(100) NOT NULL,                     -- 메뉴명
  description TEXT,                                    -- 메뉴 설명

  -- URL 및 라우팅
  url VARCHAR(255),                                    -- 메뉴 URL (예: /app/dashboard)
  parameters TEXT,                                     -- URL 파라미터

  -- 계층 구조
  parent_id BIGINT,                                    -- 상위 메뉴 ID (self-reference)
  depth INTEGER NOT NULL DEFAULT 1,                    -- 메뉴 깊이 (1, 2, 3)
  sort_order INTEGER NOT NULL DEFAULT 0,               -- 정렬 순서

  -- 메뉴 속성
  system_code VARCHAR(50) NOT NULL,                    -- 시스템 코드 (예: DASHBOARD_MAIN)
  menu_type VARCHAR(20) NOT NULL DEFAULT 'page',       -- 메뉴 타입: folder, page, link
  icon VARCHAR(50),                                    -- 아이콘 이름 (Material-UI)

  -- 메뉴 설정
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 활성화 여부 ('Y', 'N')
  is_test_page VARCHAR(1) NOT NULL DEFAULT 'N',        -- 테스트 페이지 여부 ('Y', 'N')
  requires_auth VARCHAR(1) NOT NULL DEFAULT 'Y',       -- 인증 필요 여부 ('Y', 'N')
  open_in_new_window VARCHAR(1) NOT NULL DEFAULT 'N',  -- 새 창 열기 여부 ('Y', 'N')
  dashboard_layout VARCHAR(1) NOT NULL DEFAULT 'N',    -- 대시보드 레이아웃 사용 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',          -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_menu_items_parent
    FOREIGN KEY (parent_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_menu_items_menu_type CHECK (menu_type IN ('folder', 'page', 'link')),
  CONSTRAINT chk_menu_items_depth CHECK (depth BETWEEN 1 AND 3),
  CONSTRAINT chk_menu_items_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_is_test_page CHECK (is_test_page IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_requires_auth CHECK (requires_auth IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_open_in_new_window CHECK (open_in_new_window IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_dashboard_layout CHECK (dashboard_layout IN ('Y', 'N')),
  CONSTRAINT chk_menu_items_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_menu_items_menu_code ON rsms.menu_items(menu_code) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_parent_id ON rsms.menu_items(parent_id) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_system_code ON rsms.menu_items(system_code) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_depth ON rsms.menu_items(depth) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_is_active ON rsms.menu_items(is_active) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_requires_auth ON rsms.menu_items(requires_auth) WHERE is_deleted = 'N';
CREATE INDEX idx_menu_items_sort_order ON rsms.menu_items(sort_order);

-- 복합 인덱스 (메뉴 트리 조회 최적화)
CREATE INDEX idx_menu_items_tree ON rsms.menu_items(parent_id, sort_order)
  WHERE is_deleted = 'N' AND is_active = 'Y';

-- 부분 인덱스 (활성 메뉴만)
CREATE INDEX idx_menu_items_active ON rsms.menu_items(menu_id)
  WHERE is_deleted = 'N' AND is_active = 'Y';

-- 전문 검색 인덱스 (한글 지원 - pg_trgm 확장 사용)
-- 설치 필요: CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_menu_items_fulltext ON rsms.menu_items
--   USING gin(menu_name gin_trgm_ops)
--   WHERE is_deleted = 'N';

-- 기본 텍스트 검색 인덱스 (simple 설정 사용)
CREATE INDEX idx_menu_items_search ON rsms.menu_items
  USING gin(to_tsvector('simple', menu_name || ' ' || COALESCE(description, '')))
  WHERE is_deleted = 'N';

-- 코멘트 추가
COMMENT ON TABLE rsms.menu_items IS '시스템 메뉴 계층 구조 (MenuMgmt UI 트리)';
COMMENT ON COLUMN rsms.menu_items.menu_id IS '메뉴ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.menu_items.menu_code IS '메뉴 코드: 01(1depth), 0101(2depth), 0802(3depth)';
COMMENT ON COLUMN rsms.menu_items.menu_name IS '메뉴명';
COMMENT ON COLUMN rsms.menu_items.description IS '메뉴 설명';
COMMENT ON COLUMN rsms.menu_items.url IS '메뉴 URL (예: /app/dashboard)';
COMMENT ON COLUMN rsms.menu_items.parameters IS 'URL 파라미터';
COMMENT ON COLUMN rsms.menu_items.parent_id IS '상위 메뉴 ID (NULL이면 최상위)';
COMMENT ON COLUMN rsms.menu_items.depth IS '메뉴 깊이 (1: 대메뉴, 2: 중메뉴, 3: 소메뉴)';
COMMENT ON COLUMN rsms.menu_items.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.menu_items.system_code IS '시스템 코드 (예: DASHBOARD_MAIN, USER_MGMT)';
COMMENT ON COLUMN rsms.menu_items.menu_type IS 'folder: 폴더, page: 페이지, link: 외부 링크';
COMMENT ON COLUMN rsms.menu_items.icon IS '아이콘 이름 (Material-UI)';
COMMENT ON COLUMN rsms.menu_items.is_active IS '활성화 여부';
COMMENT ON COLUMN rsms.menu_items.is_test_page IS '테스트 페이지 여부';
COMMENT ON COLUMN rsms.menu_items.requires_auth IS 'TRUE면 로그인 필요, FALSE면 익명 접근 가능';
COMMENT ON COLUMN rsms.menu_items.open_in_new_window IS '새 창 열기 여부';
COMMENT ON COLUMN rsms.menu_items.dashboard_layout IS '대시보드 레이아웃 사용 여부';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON rsms.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료
