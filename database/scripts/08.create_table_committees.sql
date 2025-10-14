
-- =====================================================
-- 회의체 테이블 (committees)
-- =====================================================
-- 설명: 회의체 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-14
-- 참고:
--   - 회의체명, 개최주기, 심의의결사항 등을 관리
--   - committee_frequency는 common_code_details에서 group_code='CFRN_CYCL_DVCD'로 관리
--   - 위원장 및 위원 정보는 별도 상세테이블(committee_members)에서 관리
-- =====================================================

-- DROP TABLE IF EXISTS rsms.committees CASCADE;

CREATE TABLE rsms.committees (
  -- 기본키 (대리키)
  committees_id BIGSERIAL PRIMARY KEY,                 -- 회의체ID (PK, 자동증가)

  -- 기본 정보
  committees_title VARCHAR(100) NOT NULL,              -- 회의체명
  committee_frequency VARCHAR(20) NULL,                -- 개최주기코드 (common_code_details의 CFRN_CYCL_DVCD 그룹 참조)
  resolution_matters VARCHAR(1000) NULL,               -- 주요심의 의결사항

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 체크 제약조건
  CONSTRAINT chk_committees_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_committees_title ON rsms.committees(committees_title);
CREATE INDEX idx_committees_frequency ON rsms.committees(committee_frequency);
CREATE INDEX idx_committees_is_active ON rsms.committees(is_active);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_committees_active_frequency ON rsms.committees(is_active, committee_frequency);

-- 코멘트 추가
COMMENT ON TABLE rsms.committees IS '회의체 테이블 - 회의체 정보를 관리';
COMMENT ON COLUMN rsms.committees.committees_id IS '회의체ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.committees.committees_title IS '회의체명';
COMMENT ON COLUMN rsms.committees.committee_frequency IS '개최주기코드 (common_code_details의 CFRN_CYCL_DVCD 그룹 참조, 예: 월1회, 분기1회, 수시)';
COMMENT ON COLUMN rsms.committees.resolution_matters IS '주요심의 의결사항';
COMMENT ON COLUMN rsms.committees.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.committees.created_by IS '생성자';
COMMENT ON COLUMN rsms.committees.created_at IS '생성일시';
COMMENT ON COLUMN rsms.committees.updated_by IS '수정자';
COMMENT ON COLUMN rsms.committees.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION rsms.update_committees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_committees_updated_at
  BEFORE UPDATE ON rsms.committees
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_committees_updated_at();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: common_code_details의 CFRN_CYCL_DVCD 그룹에 개최주기 코드가 미리 등록되어 있어야 함
/*
INSERT INTO rsms.committees (committees_title, committee_frequency, resolution_matters, is_active, created_by, updated_by) VALUES
  ('이사회', 'FREQ_MONTHLY', '경영전략, 예산승인, 주요 투자 의결', 'Y', 'SYSTEM', 'SYSTEM'),
  ('리스크관리위원회', 'FREQ_QUARTERLY', '리스크 관리방안, 한도설정, 모니터링', 'Y', 'SYSTEM', 'SYSTEM'),
  ('감사위원회', 'FREQ_QUARTERLY', '내부감사, 회계감사, 준법감시', 'Y', 'SYSTEM', 'SYSTEM'),
  ('경영위원회', 'FREQ_WEEKLY', '일상 경영사항, 업무보고, 주요 안건 검토', 'Y', 'SYSTEM', 'SYSTEM'),
  ('투자심사위원회', 'FREQ_AS_NEEDED', '투자안 검토, 투자 승인, 사후관리', 'N', 'SYSTEM', 'SYSTEM');
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (committees_id는 자동 생성됨):
-- INSERT INTO rsms.committees (committees_title, committee_frequency, resolution_matters, created_by, updated_by)
-- VALUES ('이사회', 'FREQ_MONTHLY', '경영전략, 예산승인, 주요 투자 의결', 'ADMIN', 'ADMIN');
--
-- 2. 사용중인 회의체 조회:
-- SELECT * FROM rsms.committees WHERE is_active = 'Y';
--
-- 3. 개최주기별 회의체 조회:
-- SELECT * FROM rsms.committees WHERE committee_frequency = 'FREQ_MONTHLY';
--
-- 4. 회의체명으로 검색:
-- SELECT * FROM rsms.committees WHERE committees_title LIKE '%이사회%';
--
-- 5. 개최주기별 회의체 수 집계:
-- SELECT committee_frequency, COUNT(*) as committee_count
-- FROM rsms.committees
-- WHERE is_active = 'Y'
-- GROUP BY committee_frequency;
--
-- 6. committee_members 테이블과 조인하여 위원 정보 조회:
-- SELECT
--   c.committees_title,
--   c.committee_frequency,
--   cm.member_role,
--   cm.positions_cd
-- FROM rsms.committees c
-- LEFT JOIN rsms.committee_members cm ON c.committees_id = cm.committees_id
-- WHERE c.is_active = 'Y';
