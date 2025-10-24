
-- =====================================================
-- 직책 테이블 (positions)
-- =====================================================
-- 설명: 원장차수별 직책 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - 원장차수별로 직책을 관리
--   - positions_cd는 common_code_details에서 group_code='RSBT_RSOF_DVCD'로 관리
--   - 같은 원장차수에서 같은 직책이 본부별로 여러 개 존재 가능
--   - UNIQUE 제약조건으로 (원장차수 + 직책코드 + 본부코드) 조합의 유일성 보장
-- =====================================================

-- DROP TABLE IF EXISTS rsms.positions CASCADE;

CREATE TABLE rsms.positions (
  -- 기본키 (대리키)
  positions_id BIGSERIAL PRIMARY KEY,                  -- 직책ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  positions_cd VARCHAR(20) NOT NULL,                   -- 직책코드 (common_code_details의 RSBT_RSOF_DVCD 그룹 참조)
  positions_name VARCHAR(200) NOT NULL,                -- 직책명
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (common_code_details의 DPRM_CD 그룹 참조)
  hq_name VARCHAR(200) NOT NULL,                       -- 본부명

  -- 만료 정보
  expiration_date DATE NOT NULL DEFAULT '9999-12-31',  -- 만료일 (기본값: 9999-12-31)

  -- 상태 정보
  positions_status VARCHAR(20) NULL,                   -- 상태 (나중에 사용 예정)
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')
  is_concurrent VARCHAR(1) NOT NULL DEFAULT 'N',       -- 겸직여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_positions_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 원장차수 + 직책코드 + 본부코드 조합은 유일)
  CONSTRAINT uk_positions_ledger_position_hq
    UNIQUE (ledger_order_id, positions_cd, hq_code),

  -- 유일성 제약조건 (position_concurrents 외래키 참조용)
  CONSTRAINT uk_positions_ledger_position
    UNIQUE (ledger_order_id, positions_cd),

  -- 체크 제약조건
  CONSTRAINT chk_positions_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_positions_is_concurrent CHECK (is_concurrent IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_positions_ledger_order_id ON rsms.positions(ledger_order_id);
CREATE INDEX idx_positions_positions_cd ON rsms.positions(positions_cd);
CREATE INDEX idx_positions_positions_name ON rsms.positions(positions_name);
CREATE INDEX idx_positions_hq_code ON rsms.positions(hq_code);
CREATE INDEX idx_positions_expiration_date ON rsms.positions(expiration_date);
CREATE INDEX idx_positions_positions_status ON rsms.positions(positions_status);
CREATE INDEX idx_positions_is_active ON rsms.positions(is_active);
CREATE INDEX idx_positions_is_concurrent ON rsms.positions(is_concurrent);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_positions_ledger_positions ON rsms.positions(ledger_order_id, positions_cd);
CREATE INDEX idx_positions_ledger_hq ON rsms.positions(ledger_order_id, hq_code);
CREATE INDEX idx_positions_hq_positions ON rsms.positions(hq_code, positions_cd);
CREATE INDEX idx_positions_active_concurrent ON rsms.positions(is_active, is_concurrent);

-- 코멘트 추가
COMMENT ON TABLE rsms.positions IS '직책 테이블 - 원장차수별 직책 정보를 관리';
COMMENT ON COLUMN rsms.positions.positions_id IS '직책ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.positions.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.positions.positions_cd IS '직책코드 (common_code_details의 RSBT_RSOF_DVCD 그룹 참조, 애플리케이션 레벨 검증)';
COMMENT ON COLUMN rsms.positions.positions_name IS '직책명';
COMMENT ON COLUMN rsms.positions.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조, 애플리케이션 레벨 검증)';
COMMENT ON COLUMN rsms.positions.hq_name IS '본부명';
COMMENT ON COLUMN rsms.positions.expiration_date IS '만료일 (기본값: 9999-12-31)';
COMMENT ON COLUMN rsms.positions.positions_status IS '상태 (나중에 사용 예정)';
COMMENT ON COLUMN rsms.positions.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.positions.is_concurrent IS '겸직여부 (Y: 겸직, N: 전임)';
COMMENT ON COLUMN rsms.positions.created_by IS '생성자';
COMMENT ON COLUMN rsms.positions.created_at IS '생성일시';
COMMENT ON COLUMN rsms.positions.updated_by IS '수정자';
COMMENT ON COLUMN rsms.positions.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신 (공통 함수 사용)
CREATE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON rsms.positions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: ledger_order, common_code_details에 데이터가 미리 등록되어 있어야 함
/*
INSERT INTO rsms.positions (ledger_order_id, positions_cd, hq_code, expiration_date, is_active, is_concurrent, created_by, updated_by) VALUES
  ('20250001', 'POS001', '1010', '9999-12-31', 'Y', 'N', 'SYSTEM', 'SYSTEM'),
  ('20250001', 'POS002', '1010', '9999-12-31', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250001', 'POS001', '1011', '2025-12-31', 'Y', 'N', 'SYSTEM', 'SYSTEM'),
  ('20250001', 'POS003', '1017', '9999-12-31', 'N', 'N', 'SYSTEM', 'SYSTEM');
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (positions_id는 자동 생성됨):
-- INSERT INTO rsms.positions (ledger_order_id, positions_cd, hq_code, created_by, updated_by)
-- VALUES ('20250001', 'POS001', '1010', 'ADMIN', 'ADMIN');
--
-- 2. FK 참조 용이 (다른 테이블에서 positions_id만 참조):
-- CREATE TABLE position_assignments (
--   assignment_id BIGSERIAL PRIMARY KEY,
--   positions_id BIGINT NOT NULL REFERENCES rsms.positions(positions_id)
-- );
--
-- 3. 유일성 제약조건으로 중복 방지:
-- 같은 원장차수 + 직책코드 + 본부코드 조합으로 INSERT 시도하면 에러 발생
-- INSERT INTO rsms.positions (ledger_order_id, positions_cd, hq_code, created_by, updated_by)
-- VALUES ('20250001', 'POS001', '1010', 'ADMIN', 'ADMIN'); -- ERROR: duplicate key
--
-- 4. 원장차수별 직책 조회:
-- SELECT * FROM rsms.positions WHERE ledger_order_id = '20250001';
--
-- 5. 본부별 직책 조회:
-- SELECT * FROM rsms.positions WHERE hq_code = '1010';
--
-- 6. 만료되지 않은 직책 조회:
-- SELECT * FROM rsms.positions WHERE expiration_date > CURRENT_DATE;
--
-- 7. 사용중인 직책 조회:
-- SELECT * FROM rsms.positions WHERE is_active = 'Y';
--
-- 8. 겸직 직책 조회:
-- SELECT * FROM rsms.positions WHERE is_concurrent = 'Y';
