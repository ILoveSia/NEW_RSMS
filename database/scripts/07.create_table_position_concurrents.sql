
-- =====================================================
-- 직책겸직 테이블 (position_concurrents)
-- =====================================================
-- 설명: 겸직 직책 그룹 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - 하나의 겸직그룹에 여러 직책이 소속됨 (1:N 관계)
--   - 겸직그룹 내에서 대표 직책을 지정할 수 있음 (대표여부)
--   - positions 테이블의 is_concurrent = 'Y'인 직책들만 등록 가능
--   - 같은 겸직그룹에 같은 직책은 한 번만 등록 가능
-- =====================================================

-- DROP TABLE IF EXISTS rsms.position_concurrents CASCADE;

CREATE TABLE rsms.position_concurrents (
  -- 기본키 (대리키)
  position_concurrent_id BIGSERIAL PRIMARY KEY,        -- 직책겸직ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)
  positions_cd VARCHAR(20) NOT NULL,                   -- 직책코드 (FK → positions.positions_cd)

  -- 기본 정보
  concurrent_group_cd VARCHAR(20) NOT NULL,            -- 겸직직책그룹코드 (예: G0001, G0002, ...)
  positions_name VARCHAR(200) NULL,                    -- 직책명 (denormalization for performance)
  is_representative VARCHAR(1) NOT NULL DEFAULT 'N',   -- 대표여부 ('Y', 'N')
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (common_code_details의 DPRM_CD 그룹 참조)
  hq_name VARCHAR(200) NOT NULL,                       -- 본부명

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_position_concurrents_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_position_concurrents_positions
    FOREIGN KEY (ledger_order_id, positions_cd)
    REFERENCES rsms.positions(ledger_order_id, positions_cd)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 겸직그룹 + 원장차수 + 직책코드 조합은 유일)
  CONSTRAINT uk_position_concurrents_group_position
    UNIQUE (concurrent_group_cd, ledger_order_id, positions_cd),

  -- 체크 제약조건
  CONSTRAINT chk_position_concurrents_is_representative CHECK (is_representative IN ('Y', 'N')),
  CONSTRAINT chk_position_concurrents_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_position_concurrents_positions_cd ON rsms.position_concurrents(positions_cd);
CREATE INDEX idx_position_concurrents_group_cd ON rsms.position_concurrents(concurrent_group_cd);
CREATE INDEX idx_position_concurrents_is_representative ON rsms.position_concurrents(is_representative);
CREATE INDEX idx_position_concurrents_hq_code ON rsms.position_concurrents(hq_code);
CREATE INDEX idx_position_concurrents_is_active ON rsms.position_concurrents(is_active);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_position_concurrents_group_representative ON rsms.position_concurrents(concurrent_group_cd, is_representative);
CREATE INDEX idx_position_concurrents_hq_positions ON rsms.position_concurrents(hq_code, positions_cd);
CREATE INDEX idx_position_concurrents_active_representative ON rsms.position_concurrents(is_active, is_representative);

-- 코멘트 추가
COMMENT ON TABLE rsms.position_concurrents IS '직책겸직 테이블 - 겸직 직책 그룹 정보를 관리';
COMMENT ON COLUMN rsms.position_concurrents.position_concurrent_id IS '직책겸직ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.position_concurrents.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.position_concurrents.positions_cd IS '직책코드 (FK → positions.positions_cd, is_concurrent = Y인 직책만 가능)';
COMMENT ON COLUMN rsms.position_concurrents.concurrent_group_cd IS '겸직직책그룹코드 (예: G0001, G0002, G0003, ...)';
COMMENT ON COLUMN rsms.position_concurrents.positions_name IS '직책명 (비정규화, 조회 성능 향상용)';
COMMENT ON COLUMN rsms.position_concurrents.is_representative IS '대표여부 (Y: 대표직책, N: 일반직책)';
COMMENT ON COLUMN rsms.position_concurrents.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조)';
COMMENT ON COLUMN rsms.position_concurrents.hq_name IS '본부명';
COMMENT ON COLUMN rsms.position_concurrents.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.position_concurrents.created_by IS '생성자';
COMMENT ON COLUMN rsms.position_concurrents.created_at IS '생성일시';
COMMENT ON COLUMN rsms.position_concurrents.updated_by IS '수정자';
COMMENT ON COLUMN rsms.position_concurrents.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신 (공통 함수 사용)
CREATE TRIGGER trg_position_concurrents_updated_at
  BEFORE UPDATE ON rsms.position_concurrents
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: positions 테이블에 is_concurrent = 'Y'인 데이터가 미리 등록되어 있어야 함
/*
-- 겸직그룹 G001: 2개 직책 (R106이 대표)
INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by) VALUES
  ('20250101', 'R107', 'G0001', '오토체결본부장', 'N', 'DEPT001', '오토체결본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R106', 'G0001', '오토금융본부장', 'Y', 'BRANCH001', '오토금융본부', 'Y', 'SYSTEM', 'SYSTEM');

-- 겸직그룹 G002: 3개 직책 (R002가 대표)
INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by) VALUES
  ('20250101', 'R002', 'G0002', '감사본부장', 'Y', 'DEPT003', '감사본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R003', 'G0002', '준법감사인', 'N', 'DEPT004', '준법감시인본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R001', 'G0002', '대표이사', 'N', 'DEPT005', 'CEO본부', 'Y', 'SYSTEM', 'SYSTEM');

-- 겸직그룹 G003: 2개 직책 (R004가 대표)
INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by) VALUES
  ('20250101', 'R004', 'G0003', '경영전략본부장', 'Y', 'DEPT006', '경영전략본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R000', 'G0003', '사외이사', 'N', 'BRANCH002', '사외이사본부', 'Y', 'SYSTEM', 'SYSTEM');

-- 겸직그룹 G004: 2개 직책 (R105가 대표)
INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by) VALUES
  ('20250101', 'R105', 'G0004', '여신심사본부장', 'Y', 'DEPT008', '여신심사본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R006', 'G0004', '리스크관리본부장', 'N', 'BRANCH003', '리스크관리본부', 'Y', 'SYSTEM', 'SYSTEM');

-- 겸직그룹 G005: 2개 직책 (R005가 대표)
INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by) VALUES
  ('20250101', 'R005', 'G0005', '디지털IT본부장', 'Y', 'DEPT010', '디지털IT본부', 'Y', 'SYSTEM', 'SYSTEM'),
  ('20250101', 'R007', 'G0005', '경영지원본부장', 'N', 'DEPT011', '경영지원본부', 'Y', 'SYSTEM', 'SYSTEM');
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (position_concurrent_id는 자동 생성됨):
-- INSERT INTO rsms.position_concurrents (ledger_order_id, positions_cd, concurrent_group_cd, positions_name, is_representative, hq_code, hq_name, is_active, created_by, updated_by)
-- VALUES ('20250101', 'R107', 'G0001', '오토체결본부장', 'N', 'DEPT001', '오토체결본부', 'Y', 'ADMIN', 'ADMIN');
--
-- 2. 특정 겸직그룹의 모든 직책 조회:
-- SELECT * FROM rsms.position_concurrents WHERE concurrent_group_cd = 'G0001' ORDER BY is_representative DESC;
--
-- 3. 특정 겸직그룹의 대표 직책 조회:
-- SELECT * FROM rsms.position_concurrents WHERE concurrent_group_cd = 'G0001' AND is_representative = 'Y';
--
-- 4. 겸직그룹별 직책 수 집계:
-- SELECT concurrent_group_cd, COUNT(*) as position_count
-- FROM rsms.position_concurrents
-- GROUP BY concurrent_group_cd;
--
-- 5. positions 테이블과 조인하여 상세 정보 조회 (positions_cd로 조인):
-- SELECT
--   pc.concurrent_group_cd,
--   pc.positions_cd,
--   pc.positions_name,
--   pc.is_representative,
--   pc.hq_code,
--   pc.hq_name,
--   p.is_concurrent
-- FROM rsms.position_concurrents pc
-- JOIN rsms.positions p ON pc.positions_cd = p.positions_cd
-- WHERE pc.concurrent_group_cd = 'G0001';
--
-- 6. 겸직 직책만 조회 (positions와 조인):
-- SELECT pc.*, p.is_concurrent
-- FROM rsms.position_concurrents pc
-- JOIN rsms.positions p ON pc.positions_cd = p.positions_cd
-- WHERE p.is_concurrent = 'Y';
--
-- 7. 겸직그룹별 대표 직책 변경:
-- UPDATE rsms.position_concurrents SET is_representative = 'N' WHERE concurrent_group_cd = 'G0001';
-- UPDATE rsms.position_concurrents SET is_representative = 'Y' WHERE position_concurrent_id = 2;
--
-- 8. CASCADE DELETE 동작:
-- positions 레코드가 삭제되면 해당 직책의 겸직 정보도 자동 삭제됨
-- DELETE FROM rsms.positions WHERE positions_cd = 'R107';
-- → position_concurrents의 positions_cd = 'R107'인 레코드도 삭제
--
-- 9. 사용중인 겸직 직책 조회:
-- SELECT * FROM rsms.position_concurrents WHERE is_active = 'Y';
--
-- 10. 사용중이면서 대표인 직책 조회:
-- SELECT * FROM rsms.position_concurrents WHERE is_active = 'Y' AND is_representative = 'Y';
