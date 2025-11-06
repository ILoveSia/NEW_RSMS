-- =====================================================================================
-- V007: 책무 관련 테이블 PK 변경 (Auto-increment → Business Code)
-- =====================================================================================
-- 목적: 책무 관리 테이블들의 PK를 자동증가 숫자에서 업무 코드로 변경
-- 작성일: 2025-11-05
-- =====================================================================================
-- 변경 대상 테이블:
--   1. responsibilities: responsibility_id (BIGSERIAL) → responsibility_cd (VARCHAR)
--   2. responsibility_details: responsibility_detail_id (BIGSERIAL) → responsibility_detail_cd (VARCHAR)
--   3. management_obligations: management_obligation_id (BIGSERIAL) → obligation_cd (VARCHAR)
-- =====================================================================================

-- =====================================================================================
-- STEP 1: management_obligations 테이블 변경
-- =====================================================================================
-- 설명: 가장 하위 테이블부터 변경 (FK 의존성 순서 고려)
-- =====================================================================================

-- 1.1. 기존 제약조건 삭제
ALTER TABLE rsms.management_obligations
  DROP CONSTRAINT IF EXISTS fk_management_obligations_resp_detail;

-- 1.2. 기존 인덱스 삭제
DROP INDEX IF EXISTS rsms.idx_mgmt_obligations_resp_detail_id;

-- 1.3. PK 변경: management_obligation_id → obligation_cd
-- (1) 기존 PK 제약조건 삭제
ALTER TABLE rsms.management_obligations
  DROP CONSTRAINT IF EXISTS management_obligations_pkey;

-- (2) obligation_cd를 새로운 PK로 설정
ALTER TABLE rsms.management_obligations
  ADD CONSTRAINT management_obligations_pkey PRIMARY KEY (obligation_cd);

-- (3) 기존 PK 컬럼 삭제
ALTER TABLE rsms.management_obligations
  DROP COLUMN IF EXISTS management_obligation_id;

-- 1.4. FK 컬럼 타입 변경: responsibility_detail_id (BIGINT) → responsibility_detail_cd (VARCHAR)
-- (1) 새 컬럼 추가
ALTER TABLE rsms.management_obligations
  ADD COLUMN responsibility_detail_cd VARCHAR(30);

-- (2) 기존 컬럼 삭제 (현재 개발 환경이므로 데이터 없음)
ALTER TABLE rsms.management_obligations
  DROP COLUMN IF EXISTS responsibility_detail_id;

-- (3) 새 컬럼에 NOT NULL 제약조건 추가
ALTER TABLE rsms.management_obligations
  ALTER COLUMN responsibility_detail_cd SET NOT NULL;

-- 1.5. 새로운 인덱스 생성
CREATE INDEX idx_mgmt_obligations_resp_detail_cd
  ON rsms.management_obligations(responsibility_detail_cd);

CREATE INDEX idx_mgmt_obligations_detail_active
  ON rsms.management_obligations(responsibility_detail_cd, is_active);

CREATE INDEX idx_mgmt_obligations_major_middle
  ON rsms.management_obligations(obligation_major_cat_cd, obligation_middle_cat_cd);

CREATE INDEX idx_mgmt_obligations_org_active
  ON rsms.management_obligations(org_code, is_active);

-- 1.6. 컬럼 코멘트 업데이트
COMMENT ON COLUMN rsms.management_obligations.obligation_cd IS '관리의무코드 (PK, 업무코드 - 형식: 책무세부코드 + MO + 순번4자리, 예: RM0001D0001MO0001)';
COMMENT ON COLUMN rsms.management_obligations.responsibility_detail_cd IS '책무세부코드 (FK → responsibility_details.responsibility_detail_cd)';

-- =====================================================================================
-- STEP 2: responsibility_details 테이블 변경
-- =====================================================================================

-- 2.1. 기존 제약조건 삭제
ALTER TABLE rsms.responsibility_details
  DROP CONSTRAINT IF EXISTS fk_responsibility_details_responsibility;

-- 2.2. 기존 인덱스 삭제
DROP INDEX IF EXISTS rsms.idx_responsibility_details_responsibility_id;
DROP INDEX IF EXISTS rsms.idx_responsibility_details_resp_active;

-- 2.3. PK 변경: responsibility_detail_id → responsibility_detail_cd
-- (1) 기존 PK 제약조건 삭제
ALTER TABLE rsms.responsibility_details
  DROP CONSTRAINT IF EXISTS responsibility_details_pkey;

-- (2) responsibility_detail_cd를 새로운 PK로 설정
ALTER TABLE rsms.responsibility_details
  ADD CONSTRAINT responsibility_details_pkey PRIMARY KEY (responsibility_detail_cd);

-- (3) 기존 PK 컬럼 삭제
ALTER TABLE rsms.responsibility_details
  DROP COLUMN IF EXISTS responsibility_detail_id;

-- 2.4. FK 컬럼 타입 변경: responsibility_id (BIGINT) → responsibility_cd (VARCHAR)
-- (1) 새 컬럼 추가
ALTER TABLE rsms.responsibility_details
  ADD COLUMN responsibility_cd VARCHAR(20);

-- (2) 기존 컬럼 삭제
ALTER TABLE rsms.responsibility_details
  DROP COLUMN IF EXISTS responsibility_id;

-- (3) 새 컬럼에 NOT NULL 제약조건 추가
ALTER TABLE rsms.responsibility_details
  ALTER COLUMN responsibility_cd SET NOT NULL;

-- 2.5. 새로운 인덱스 생성
CREATE INDEX idx_responsibility_details_responsibility_cd
  ON rsms.responsibility_details(responsibility_cd);

CREATE INDEX idx_responsibility_details_resp_active
  ON rsms.responsibility_details(responsibility_cd, is_active);

-- 2.6. 컬럼 코멘트 업데이트
COMMENT ON COLUMN rsms.responsibility_details.responsibility_detail_cd IS '책무세부코드 (PK, 업무코드 - 형식: 책무코드 뒷 9자리 + D + 순번4자리, 예: RM0001D0001)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_cd IS '책무코드 (FK → responsibilities.responsibility_cd)';

-- =====================================================================================
-- STEP 3: responsibilities 테이블 변경
-- =====================================================================================

-- 3.1. 기존 인덱스 삭제
DROP INDEX IF EXISTS rsms.idx_responsibilities_cd;

-- 3.2. PK 변경: responsibility_id → responsibility_cd
-- (1) 기존 PK 제약조건 삭제
ALTER TABLE rsms.responsibilities
  DROP CONSTRAINT IF EXISTS responsibilities_pkey;

-- (2) responsibility_cd를 새로운 PK로 설정
ALTER TABLE rsms.responsibilities
  ADD CONSTRAINT responsibilities_pkey PRIMARY KEY (responsibility_cd);

-- (3) 기존 PK 컬럼 삭제
ALTER TABLE rsms.responsibilities
  DROP COLUMN IF EXISTS responsibility_id;

-- 3.3. 새로운 인덱스 생성 (코드 생성용)
CREATE INDEX idx_responsibilities_ledger_cat
  ON rsms.responsibilities(ledger_order_id, responsibility_cat);

CREATE INDEX idx_responsibilities_positions_active
  ON rsms.responsibilities(positions_id, is_active);

-- 3.4. 컬럼 코멘트 업데이트
COMMENT ON COLUMN rsms.responsibilities.responsibility_cd IS '책무코드 (PK, 업무코드 - 형식: ledger_order_id + responsibility_cat + 순번4자리, 예: 20250001RM0001)';

-- =====================================================================================
-- STEP 4: FK 제약조건 재생성 (역순으로 생성)
-- =====================================================================================

-- 4.1. responsibilities → responsibility_details FK
ALTER TABLE rsms.responsibility_details
  ADD CONSTRAINT fk_responsibility_details_responsibility
    FOREIGN KEY (responsibility_cd)
    REFERENCES rsms.responsibilities(responsibility_cd)
    ON DELETE CASCADE;

-- 4.2. responsibility_details → management_obligations FK
ALTER TABLE rsms.management_obligations
  ADD CONSTRAINT fk_management_obligations_resp_detail
    FOREIGN KEY (responsibility_detail_cd)
    REFERENCES rsms.responsibility_details(responsibility_detail_cd)
    ON DELETE CASCADE;

-- =====================================================================================
-- STEP 5: 테이블 코멘트 업데이트
-- =====================================================================================

COMMENT ON TABLE rsms.responsibilities IS '책무 정보를 관리하는 테이블 (코드 체계: 원장차수+카테고리+순번)';
COMMENT ON TABLE rsms.responsibility_details IS '책무세부 정보를 관리하는 테이블 (1:N 관계, 코드 체계: 책무코드suffix+D+순번)';
COMMENT ON TABLE rsms.management_obligations IS '책무세부에 대한 관리의무 정보를 관리하는 테이블 (1:N 관계, 코드 체계: 책무세부코드+MO+순번)';

-- =====================================================================================
-- STEP 6: 검증 쿼리 (선택사항)
-- =====================================================================================
-- 실행 후 제약조건 확인용 쿼리
/*
-- PK 확인
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name IN ('responsibilities', 'responsibility_details', 'management_obligations')
ORDER BY tc.table_name;

-- FK 확인
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name IN ('responsibilities', 'responsibility_details', 'management_obligations')
ORDER BY tc.table_name;

-- 인덱스 확인
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'rsms'
  AND tablename IN ('responsibilities', 'responsibility_details', 'management_obligations')
ORDER BY tablename, indexname;
*/

-- =====================================================================================
-- 마이그레이션 완료
-- =====================================================================================
-- 다음 단계:
--   1. Backend 애플리케이션에서 코드 생성 로직 사용
--   2. Repository 쿼리 메서드를 통한 최대 순번 조회
--   3. Service 계층에서 자동 코드 생성 후 Entity 저장
-- =====================================================================================
