
-- =====================================================
-- 회의체 상세 테이블 (committee_details)
-- =====================================================
-- 설명: 회의체별 위원장 및 위원 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - committees 테이블과 1:N 관계
--   - 하나의 회의체에 여러 위원(위원장 포함) 소속
--   - committees_type은 common_code_details에서 group_code='CMITE_DVCD'로 관리 (예: 위원장, 위원)
--   - 비즈니스 규칙: 회의체당 위원장 1명 필수, 위원 1명 이상 필수
-- =====================================================

-- DROP TABLE IF EXISTS rsms.committee_details CASCADE;

CREATE TABLE rsms.committee_details (
  -- 기본키 (대리키)
  committee_details_id BIGSERIAL PRIMARY KEY,          -- 회의체상세ID (PK, 자동증가)

  -- 외래키
  committees_id BIGINT NOT NULL,                       -- 회의체ID (FK → committees)

  -- 기본 정보
  committees_type VARCHAR(20) NOT NULL,                -- 위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조)
  committees_members VARCHAR(20) NOT NULL,             -- 회의체 멤버(직책코드) (positions의 positions_cd 참조)

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

  -- 유일성 제약조건 (비즈니스 로직: 같은 회의체에 같은 멤버 중복 불가)
  CONSTRAINT uk_committee_details_committee_member
    UNIQUE (committees_id, committees_members)
);

-- 인덱스 생성
CREATE INDEX idx_committee_details_committees_id ON rsms.committee_details(committees_id);
CREATE INDEX idx_committee_details_type ON rsms.committee_details(committees_type);
CREATE INDEX idx_committee_details_members ON rsms.committee_details(committees_members);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_committee_details_committee_type ON rsms.committee_details(committees_id, committees_type);

-- 코멘트 추가
COMMENT ON TABLE rsms.committee_details IS '회의체 상세 테이블 - 회의체별 위원장 및 위원 정보를 관리';
COMMENT ON COLUMN rsms.committee_details.committee_details_id IS '회의체상세ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.committee_details.committees_id IS '회의체ID (FK → committees)';
COMMENT ON COLUMN rsms.committee_details.committees_type IS '위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조, 예: CHAIR-위원장, MEMBER-위원)';
COMMENT ON COLUMN rsms.committee_details.committees_members IS '회의체 멤버(직책코드) (positions의 positions_cd 참조) - 비즈니스 규칙: committees.committees_id 하나에 위원장(CHAIR)은 반드시 1명, 위원(MEMBER)은 1명 이상 필수';
COMMENT ON COLUMN rsms.committee_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.committee_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.committee_details.updated_by IS '수정자';
COMMENT ON COLUMN rsms.committee_details.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION rsms.update_committee_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_committee_details_updated_at
  BEFORE UPDATE ON rsms.committee_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_committee_details_updated_at();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: committees, positions, common_code_details에 데이터가 미리 등록되어 있어야 함
/*
-- 회의체 1번(이사회): 위원장 1명 + 위원 3명
INSERT INTO rsms.committee_details (committees_id, committees_type, committees_members, created_by, updated_by) VALUES
  (1, 'CHAIR', 'R001', 'SYSTEM', 'SYSTEM'),   -- 위원장: 내표이사
  (1, 'MEMBER', 'R002', 'SYSTEM', 'SYSTEM'),  -- 위원: 감사본부장
  (1, 'MEMBER', 'R004', 'SYSTEM', 'SYSTEM'),  -- 위원: 경영전략본부장
  (1, 'MEMBER', 'R006', 'SYSTEM', 'SYSTEM');  -- 위원: 리스크관리본부장

-- 회의체 2번(리스크관리위원회): 위원장 1명 + 위원 2명
INSERT INTO rsms.committee_details (committees_id, committees_type, committees_members, created_by, updated_by) VALUES
  (2, 'CHAIR', 'R006', 'SYSTEM', 'SYSTEM'),   -- 위원장: 리스크관리본부장
  (2, 'MEMBER', 'R105', 'SYSTEM', 'SYSTEM'),  -- 위원: 여신심사본부장
  (2, 'MEMBER', 'R004', 'SYSTEM', 'SYSTEM');  -- 위원: 경영전략본부장

-- 회의체 3번(감사위원회): 위원장 1명 + 위원 2명
INSERT INTO rsms.committee_details (committees_id, committees_type, committees_members, created_by, updated_by) VALUES
  (3, 'CHAIR', 'R002', 'SYSTEM', 'SYSTEM'),   -- 위원장: 감사본부장
  (3, 'MEMBER', 'R003', 'SYSTEM', 'SYSTEM'),  -- 위원: 준법감사인
  (3, 'MEMBER', 'R001', 'SYSTEM', 'SYSTEM');  -- 위원: 내표이사
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (committee_details_id는 자동 생성됨):
-- INSERT INTO rsms.committee_details (committees_id, committees_type, committees_members, created_by, updated_by)
-- VALUES (1, 'CHAIR', 'R001', 'ADMIN', 'ADMIN');
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
-- 5. 회의체와 조인하여 전체 정보 조회:
-- SELECT
--   c.committees_title,
--   c.committee_frequency,
--   cd.committees_type,
--   cd.committees_members,
--   p.hq_code
-- FROM rsms.committees c
-- JOIN rsms.committee_details cd ON c.committees_id = cd.committees_id
-- LEFT JOIN rsms.positions p ON cd.committees_members = p.positions_cd
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
--   cd.committees_members
-- FROM rsms.committee_details cd
-- JOIN rsms.committees c ON cd.committees_id = c.committees_id
-- WHERE cd.committees_members = 'R001'
-- ORDER BY c.committees_title;
--
-- 9. CASCADE DELETE 동작:
-- committees 레코드가 삭제되면 해당 회의체의 모든 멤버 정보도 자동 삭제됨
-- DELETE FROM rsms.committees WHERE committees_id = 1;
-- → committee_details의 committees_id = 1인 레코드들도 모두 삭제
