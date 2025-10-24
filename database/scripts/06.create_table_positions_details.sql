
-- =====================================================
-- 직책 상세정보 테이블 (positions_details)
-- =====================================================
-- 설명: 직책별 조직(부서/영업점) 상세 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - positions 테이블과 1:N 관계
--   - 하나의 직책(본부)에 여러 조직(부서/영업점)이 소속됨
--   - 본부코드는 positions의 hq_code와 동일
--   - 조직코드는 organizations 테이블의 org_code 참조
-- =====================================================

-- DROP TABLE IF EXISTS rsms.positions_details CASCADE;

CREATE TABLE rsms.positions_details (
  -- 기본키 (대리키)
  positions_details_id BIGSERIAL PRIMARY KEY,          -- 직책상세ID (PK, 자동증가)

  -- 외래키
  positions_id BIGINT NOT NULL,                        -- 직책ID (FK → positions)

  -- 기본 정보
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (positions의 hq_code와 동일)
  org_code VARCHAR(20) NOT NULL,                       -- 조직코드 (FK → organizations)

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_positions_details_positions
    FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 직책 + 조직코드 조합은 유일)
  CONSTRAINT uk_positions_details_position_org
    UNIQUE (positions_id, org_code)
);

-- 인덱스 생성
CREATE INDEX idx_positions_details_positions_id ON rsms.positions_details(positions_id);
CREATE INDEX idx_positions_details_hq_code ON rsms.positions_details(hq_code);
CREATE INDEX idx_positions_details_org_code ON rsms.positions_details(org_code);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_positions_details_hq_org ON rsms.positions_details(hq_code, org_code);

-- 코멘트 추가
COMMENT ON TABLE rsms.positions_details IS '직책 상세정보 테이블 - 직책별 조직(부서/영업점) 상세 정보를 관리';
COMMENT ON COLUMN rsms.positions_details.positions_details_id IS '직책상세ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.positions_details.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.positions_details.hq_code IS '본부코드 (positions의 hq_code와 동일, common_code_details의 DPRM_CD 그룹 참조)';
COMMENT ON COLUMN rsms.positions_details.org_code IS '조직코드 (organizations의 org_code 참조)';
COMMENT ON COLUMN rsms.positions_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.positions_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.positions_details.updated_by IS '수정자';
COMMENT ON COLUMN rsms.positions_details.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
-- 트리거: updated_at 자동 갱신 (공통 함수 사용)
CREATE TRIGGER trg_positions_details_updated_at
  BEFORE UPDATE ON rsms.positions_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: positions, organizations 테이블에 데이터가 미리 등록되어 있어야 함
/*
-- positions_id = 1 (본부코드 '1010')에 3개 조직 소속
INSERT INTO rsms.positions_details (positions_id, hq_code, org_code, created_by, updated_by) VALUES
  (1, '1010', 'DEPT001', 'SYSTEM', 'SYSTEM'),
  (1, '1010', 'BRANCH001', 'SYSTEM', 'SYSTEM'),
  (1, '1010', 'BRANCH002', 'SYSTEM', 'SYSTEM');

-- positions_id = 2 (본부코드 '1011')에 2개 조직 소속
INSERT INTO rsms.positions_details (positions_id, hq_code, org_code, created_by, updated_by) VALUES
  (2, '1011', 'DEPT003', 'SYSTEM', 'SYSTEM'),
  (2, '1011', 'BRANCH003', 'SYSTEM', 'SYSTEM');
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (positions_details_id는 자동 생성됨):
-- INSERT INTO rsms.positions_details (positions_id, hq_code, org_code, created_by, updated_by)
-- VALUES (1, '1010', 'DEPT001', 'ADMIN', 'ADMIN');
--
-- 2. 특정 직책의 모든 조직 조회 (1:N 관계):
-- SELECT pd.*, o.org_name, o.org_type
-- FROM rsms.positions_details pd
-- JOIN rsms.organizations o ON pd.org_code = o.org_code
-- WHERE pd.positions_id = 1;
--
-- 3. 특정 본부의 모든 조직 조회:
-- SELECT * FROM rsms.positions_details WHERE hq_code = '1010';
--
-- 4. 직책과 조직 정보 함께 조회:
-- SELECT p.positions_cd, p.hq_code, pd.org_code, o.org_name, o.org_type
-- FROM rsms.positions p
-- JOIN rsms.positions_details pd ON p.positions_id = pd.positions_id
-- JOIN rsms.organizations o ON pd.org_code = o.org_code
-- WHERE p.ledger_order_id = '20250001';
--
-- 5. CASCADE DELETE 동작:
-- positions 레코드가 삭제되면 해당 직책의 모든 상세 정보도 자동 삭제됨
-- DELETE FROM rsms.positions WHERE positions_id = 1;
-- → positions_details의 positions_id = 1인 레코드들도 모두 삭제
--
-- 6. 특정 조직이 소속된 모든 직책 조회:
-- SELECT p.*, pd.org_code
-- FROM rsms.positions p
-- JOIN rsms.positions_details pd ON p.positions_id = pd.positions_id
-- WHERE pd.org_code = 'DEPT001';
