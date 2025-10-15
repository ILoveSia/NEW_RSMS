
-- =====================================================
-- 원장차수관리 테이블 (ledger_order)
-- =====================================================
-- 설명: 원장차수 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - ledger_order_id는 년도(4자리) + 순번(4자리) 형식 (예: 20250001, 20250002)
--   - 년도별로 순번은 0001부터 시작하여 자동 증가
--   - 생성 시 기본 상태는 '신규'
--   - 상태값은 common_code_details의 'LDGR_ORDR_ST' 그룹에서 관리
--     예: 'NEW' (신규), 'PROG' (진행중), 'CLSD' (종료)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.ledger_order CASCADE;

-- 년도별 순번 생성을 위한 시퀀스 함수
CREATE OR REPLACE FUNCTION rsms.generate_ledger_order_id()
RETURNS VARCHAR(8) AS $$
DECLARE
  current_year VARCHAR(4);
  next_seq VARCHAR(4);
  new_id VARCHAR(8);
  max_id VARCHAR(8);
BEGIN
  -- 현재 년도 추출
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- 해당 년도의 최대 ID 조회
  SELECT MAX(ledger_order_id) INTO max_id
  FROM rsms.ledger_order
  WHERE SUBSTRING(ledger_order_id, 1, 4) = current_year;

  -- 순번 계산
  IF max_id IS NULL THEN
    -- 해당 년도의 첫 번째 ID
    next_seq := '0001';
  ELSE
    -- 기존 ID의 순번 추출 후 1 증가
    next_seq := LPAD((SUBSTRING(max_id, 5, 4)::INTEGER + 1)::TEXT, 4, '0');
  END IF;

  -- 새 ID 생성
  new_id := current_year || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 테이블 생성
CREATE TABLE rsms.ledger_order (
  -- 기본키
  ledger_order_id VARCHAR(8) PRIMARY KEY DEFAULT rsms.generate_ledger_order_id(), -- 원장차수ID (년도4자리+순번4자리, 자동생성)

  -- 기본 정보
  ledger_order_title VARCHAR(200) NULL,                -- 원장 제목
  ledger_order_status VARCHAR(10) NOT NULL DEFAULT 'NEW', -- 원장상태 (NEW: 신규, PROG: 진행중, CLSD: 종료)
  ledger_order_remarks VARCHAR(500) NULL,              -- 비고

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 제약조건
  CONSTRAINT chk_ledger_order_status CHECK (ledger_order_status IN ('NEW', 'PROG', 'CLSD')),
  CONSTRAINT chk_ledger_order_id_format CHECK (
    ledger_order_id ~ '^[0-9]{8}$' AND LENGTH(ledger_order_id) = 8
  )
);

-- 인덱스 생성
CREATE INDEX idx_ledger_order_status ON rsms.ledger_order(ledger_order_status);
CREATE INDEX idx_ledger_order_title ON rsms.ledger_order(ledger_order_title);

-- 코멘트 추가
COMMENT ON TABLE rsms.ledger_order IS '원장차수관리 테이블 - 원장차수 정보를 관리';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_id IS '원장차수ID (년도4자리+순번4자리, 예: 20250001, 자동생성)';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_title IS '원장 제목';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_status IS '원장상태 (NEW: 신규, PROG: 진행중, CLSD: 종료, common_code_details의 LDGR_ORDR_ST 그룹 참조)';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_remarks IS '비고';
COMMENT ON COLUMN rsms.ledger_order.created_by IS '생성자';
COMMENT ON COLUMN rsms.ledger_order.created_at IS '생성일시';
COMMENT ON COLUMN rsms.ledger_order.updated_by IS '수정자';
COMMENT ON COLUMN rsms.ledger_order.updated_at IS '수정일시';

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: 상태코드는 common_code_details의 LDGR_ORDR_ST 그룹에 미리 등록되어 있어야 함
/*
INSERT INTO rsms.ledger_order (ledger_order_title, ledger_order_status, ledger_order_remarks, created_by, updated_by) VALUES
  ('2025년도 1차 원장', 'NEW', '2025년 1분기 원장차수 (신규)', 'SYSTEM', 'SYSTEM'),
  ('2025년도 2차 원장', 'PROG', '2025년 2분기 원장차수 (진행중)', 'SYSTEM', 'SYSTEM'),
  ('2024년도 4차 원장', 'CLSD', '2024년 4분기 원장차수 (종료)', 'SYSTEM', 'SYSTEM');
*/

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION rsms.update_ledger_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_order_updated_at
  BEFORE UPDATE ON rsms.ledger_order
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_ledger_order_updated_at();

-- 사용 예시 주석
-- INSERT 시 ledger_order_id는 자동 생성됨:
-- INSERT INTO rsms.ledger_order (ledger_order_title, ledger_order_remarks, created_by, updated_by)
-- VALUES ('2025년도 3차 원장', '2025년 3분기 원장차수', 'ADMIN', 'ADMIN');
--
-- 년도가 바뀌면 자동으로 순번이 0001부터 재시작됨:
-- 2024년: 20240001, 20240002, ...
-- 2025년: 20250001, 20250002, ...
