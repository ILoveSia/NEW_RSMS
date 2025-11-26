-- =====================================================================================
-- V014: 이사회결의 테이블 생성 (board_resolutions)
-- =====================================================================================
-- 설명:
--   - 원장차수별 이사회 결의 정보 관리
--   - 이사회결의ID 코드 생성 규칙: ledger_order_id + "B" + 순번(4자리)
--     예: 20250001B0001
--   - 회차는 원장차수별로 자동 증가 (새 원장차수 시작 시 1로 초기화)
-- 작성일: 2025-11-26
-- Flyway 마이그레이션: V014
-- 참조: database/scripts/30.create_table_board_resolutions.sql
-- =====================================================================================


-- =====================================================
-- 1. board_resolutions 테이블 생성
-- =====================================================

CREATE TABLE rsms.board_resolutions (
  -- 기본키 (원장차수ID + "B" + 순번)
  resolution_id VARCHAR(13) PRIMARY KEY,                  -- 이사회결의ID (PK)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK -> ledger_order)

  -- 기본 정보
  meeting_number INT NOT NULL,                            -- 회차 (원장차수별 자동 증가)
  resolution_name VARCHAR(200) NOT NULL,                  -- 이사회 결의명
  summary TEXT,                                           -- 요약정보
  content TEXT,                                           -- 내용

  -- 감사 정보
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  created_by VARCHAR(50) NOT NULL,                        -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                        -- 수정자

  -- 외래키 제약조건
  CONSTRAINT fk_board_resolutions_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유니크 제약조건 (원장차수별 회차 중복 방지)
  CONSTRAINT uk_board_resolutions_ledger_meeting
    UNIQUE (ledger_order_id, meeting_number)
);


-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

CREATE INDEX idx_board_resolutions_ledger_order ON rsms.board_resolutions(ledger_order_id);
CREATE INDEX idx_board_resolutions_meeting_number ON rsms.board_resolutions(meeting_number);
CREATE INDEX idx_board_resolutions_name ON rsms.board_resolutions(resolution_name);
CREATE INDEX idx_board_resolutions_created_at ON rsms.board_resolutions(created_at);


-- =====================================================
-- 3. 코멘트 추가
-- =====================================================

COMMENT ON TABLE rsms.board_resolutions IS '이사회결의 테이블 - 원장차수별 이사회 결의 정보 관리';
COMMENT ON COLUMN rsms.board_resolutions.resolution_id IS '이사회결의ID (PK) - 원장차수ID(8자리) + B + 순번(4자리)';
COMMENT ON COLUMN rsms.board_resolutions.ledger_order_id IS '원장차수ID (FK -> ledger_order)';
COMMENT ON COLUMN rsms.board_resolutions.meeting_number IS '회차 - 원장차수별 자동 증가';
COMMENT ON COLUMN rsms.board_resolutions.resolution_name IS '이사회 결의명';
COMMENT ON COLUMN rsms.board_resolutions.summary IS '요약정보';
COMMENT ON COLUMN rsms.board_resolutions.content IS '내용';
COMMENT ON COLUMN rsms.board_resolutions.created_at IS '생성일시';
COMMENT ON COLUMN rsms.board_resolutions.created_by IS '생성자';
COMMENT ON COLUMN rsms.board_resolutions.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.board_resolutions.updated_by IS '수정자';


-- =====================================================
-- 4. 트리거 생성
-- =====================================================

CREATE TRIGGER trg_board_resolutions_updated_at
  BEFORE UPDATE ON rsms.board_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();
