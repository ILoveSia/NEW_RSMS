
-- =====================================================
-- 회의체 상세 테이블 (committee_details)
-- =====================================================
-- 설명: 회의체별 위원장 및 위원 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 수정일: 2025-10-24 (positions_id FK 추가)
-- 참고:
--   - committees 테이블과 1:N 관계
--   - positions 테이블과 N:1 관계 (FK: positions_id)
--   - 하나의 회의체에 여러 위원(위원장 포함) 소속
--   - committees_type은 common_code_details에서 group_code='CMITE_DVCD'로 관리 (예: CHAIR-위원장, MEMBER-위원)
--   - 비즈니스 규칙: 회의체당 위원장 1명 필수, 위원 1명 이상 필수
--   - positions_id를 통해 positions 테이블과 완벽한 JOIN 가능 (중복 없음)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.committee_details CASCADE;

CREATE TABLE rsms.committee_details (
  -- 기본키 (대리키)
  committee_details_id BIGSERIAL PRIMARY KEY,          -- 회의체상세ID (PK, 자동증가)

  -- 외래키
  committees_id BIGINT NOT NULL,                       -- 회의체ID (FK → committees)
  positions_id BIGINT NOT NULL,                        -- 직책ID (FK → positions)

  -- 기본 정보
  committees_type VARCHAR(20) NOT NULL,                -- 위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조)

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_committee_details_committees
    FOREIGN KEY (committees_id)
    REFERENCES rsms.committees(committees_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_committee_details_positions
    FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 같은 회의체에 같은 멤버 중복 불가)
  CONSTRAINT uk_committee_details_committee_member
    UNIQUE (committees_id, positions_id)
);

-- 인덱스 생성
CREATE INDEX idx_committee_details_committees_id ON rsms.committee_details(committees_id);
CREATE INDEX idx_committee_details_positions_id ON rsms.committee_details(positions_id);
CREATE INDEX idx_committee_details_type ON rsms.committee_details(committees_type);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_committee_details_committee_type ON rsms.committee_details(committees_id, committees_type);
CREATE INDEX idx_committee_details_committee_position ON rsms.committee_details(committees_id, positions_id);

-- 코멘트 추가
COMMENT ON TABLE rsms.committee_details IS '회의체 상세 테이블 - 회의체별 위원장 및 위원 정보를 관리';
COMMENT ON COLUMN rsms.committee_details.committee_details_id IS '회의체상세ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.committee_details.committees_id IS '회의체ID (FK → committees)';
COMMENT ON COLUMN rsms.committee_details.positions_id IS '직책ID (FK → positions) - 비즈니스 규칙: committees.committees_id 하나에 위원장(CHAIR)은 반드시 1명, 위원(MEMBER)은 1명 이상 필수';
COMMENT ON COLUMN rsms.committee_details.committees_type IS '위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조, 예: CHAIR-위원장, MEMBER-위원)';
COMMENT ON COLUMN rsms.committee_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.committee_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.committee_details.updated_by IS '수정자';
COMMENT ON COLUMN rsms.committee_details.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신 (공통 함수 사용)
CREATE TRIGGER trg_committee_details_updated_at
  BEFORE UPDATE ON rsms.committee_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: committees, positions, common_code_details에 데이터가 미리 등록되어 있어야 함
/*
-- 회의체 1번(이사회): 위원장 1명 + 위원 3명
-- positions_id는 positions 테이블에서 실제 존재하는 ID를 사용해야 함
INSERT INTO rsms.committee_details (committees_id, committees_type, positions_id, created_by, updated_by) VALUES
  (1, 'CHAIR', 100, 'SYSTEM', 'SYSTEM'),   -- 위원장: positions_id=100 (대표이사)
  (1, 'MEMBER', 101, 'SYSTEM', 'SYSTEM'),  -- 위원: positions_id=101 (감사본부장)
  (1, 'MEMBER', 102, 'SYSTEM', 'SYSTEM'),  -- 위원: positions_id=102 (경영전략본부장)
  (1, 'MEMBER', 103, 'SYSTEM', 'SYSTEM');  -- 위원: positions_id=103 (리스크관리본부장)

-- 회의체 2번(리스크관리위원회): 위원장 1명 + 위원 2명
INSERT INTO rsms.committee_details (committees_id, committees_type, positions_id, created_by, updated_by) VALUES
  (2, 'CHAIR', 103, 'SYSTEM', 'SYSTEM'),   -- 위원장: positions_id=103 (리스크관리본부장)
  (2, 'MEMBER', 104, 'SYSTEM', 'SYSTEM'),  -- 위원: positions_id=104 (여신심사본부장)
  (2, 'MEMBER', 102, 'SYSTEM', 'SYSTEM');  -- 위원: positions_id=102 (경영전략본부장)

-- 회의체 3번(감사위원회): 위원장 1명 + 위원 2명
INSERT INTO rsms.committee_details (committees_id, committees_type, positions_id, created_by, updated_by) VALUES
  (3, 'CHAIR', 101, 'SYSTEM', 'SYSTEM'),   -- 위원장: positions_id=101 (감사본부장)
  (3, 'MEMBER', 105, 'SYSTEM', 'SYSTEM'),  -- 위원: positions_id=105 (준법감사인)
  (3, 'MEMBER', 100, 'SYSTEM', 'SYSTEM');  -- 위원: positions_id=100 (대표이사)
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (committee_details_id는 자동 생성됨):
-- INSERT INTO rsms.committee_details (committees_id, committees_type, positions_id, created_by, updated_by)
-- VALUES (1, 'CHAIR', 100, 'ADMIN', 'ADMIN');
--
-- 2. 특정 회의체의 모든 멤버 조회 (위원장 우선):
-- SELECT * FROM rsms.committee_details
-- WHERE committees_id = 1
-- ORDER BY committees_type;
--
-- 3. 특정 회의체의 위원장 조회:
-- SELECT * FROM rsms.committee_details
-- WHERE committees_id = 1 AND committees_type = 'CHAIR';
--
-- 4. 특정 회의체의 위원 조회:
-- SELECT * FROM rsms.committee_details
-- WHERE committees_id = 1 AND committees_type = 'MEMBER';
--
-- 5. 회의체와 조인하여 직책 정보 포함 조회 (완벽한 JOIN):
-- SELECT
--   c.committees_title,
--   c.committee_frequency,
--   cd.committees_type,
--   p.positions_cd,           -- 직책코드
--   p.positions_name,         -- 직책명
--   p.hq_name                 -- 본부명
-- FROM rsms.committees c
-- JOIN rsms.committee_details cd ON c.committees_id = cd.committees_id
-- JOIN rsms.positions p ON cd.positions_id = p.positions_id  -- FK JOIN (중복 없음)
-- WHERE c.is_active = 'Y'
-- ORDER BY c.committees_id, cd.committees_type;
--
-- 6. 회의체별 멤버 수 집계:
-- SELECT committees_id, COUNT(*) as member_count
-- FROM rsms.committee_details
-- GROUP BY committees_id;
--
-- 7. 회의체별 위원장 수 검증 (반드시 1명):
-- SELECT committees_id, COUNT(*) as chair_count
-- FROM rsms.committee_details
-- WHERE committees_type = 'CHAIR'
-- GROUP BY committees_id
-- HAVING COUNT(*) != 1;  -- 위원장이 1명이 아닌 회의체 조회
--
-- 8. 특정 직책이 참여하는 모든 회의체 조회:
-- SELECT
--   c.committees_title,
--   cd.committees_type,
--   p.positions_cd,
--   p.positions_name
-- FROM rsms.committee_details cd
-- JOIN rsms.committees c ON cd.committees_id = c.committees_id
-- JOIN rsms.positions p ON cd.positions_id = p.positions_id
-- WHERE cd.positions_id = 100  -- 특정 positions_id로 조회
-- ORDER BY c.committees_title;
--
-- 9. 원장차수별 회의체 및 직책 정보 조회:
-- SELECT
--   c.ledger_order_id,
--   c.committees_title,
--   cd.committees_type,
--   p.positions_cd,
--   p.positions_name,
--   p.hq_name
-- FROM rsms.committees c
-- JOIN rsms.committee_details cd ON c.committees_id = cd.committees_id
-- JOIN rsms.positions p ON cd.positions_id = p.positions_id
-- WHERE c.ledger_order_id = '2025001'
-- ORDER BY c.committees_id, cd.committees_type;
--
-- 10. CASCADE DELETE 동작:
-- committees 레코드가 삭제되면 해당 회의체의 모든 멤버 정보도 자동 삭제됨
-- DELETE FROM rsms.committees WHERE committees_id = 1;
-- → committee_details의 committees_id = 1인 레코드들도 모두 삭제
--
-- 11. RESTRICT DELETE 동작:
-- positions 레코드는 committee_details에서 참조 중이면 삭제 불가
-- DELETE FROM rsms.positions WHERE positions_id = 100;
-- → ERROR: 참조 무결성 위반 (committee_details에서 사용 중)
