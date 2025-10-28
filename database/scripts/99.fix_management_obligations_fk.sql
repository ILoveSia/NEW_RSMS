-- =====================================================================================
-- management_obligations 테이블 외래키 제약조건 추가
-- =====================================================================================
-- 설명: org_code 컬럼에 organizations 테이블로의 외래키 제약조건 추가
-- 작성일: 2025-10-27
-- 목적: 데이터 무결성 보장 및 참조 무결성 강화
-- =====================================================================================

-- 1. 기존 데이터 검증 (잘못된 org_code가 있는지 확인)
-- 이 쿼리가 결과를 반환하면 FK 추가 전에 데이터 정리 필요
SELECT mo.management_obligation_id, mo.org_code, mo.obligation_info
FROM rsms.management_obligations mo
LEFT JOIN rsms.organizations o ON mo.org_code = o.org_code
WHERE o.org_code IS NULL;

-- 2. 외래키 제약조건 추가
ALTER TABLE rsms.management_obligations
  ADD CONSTRAINT fk_management_obligations_org_code
    FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code)
    ON DELETE RESTRICT     -- organizations 삭제 시 management_obligations에 레코드가 있으면 삭제 불가
    ON UPDATE CASCADE;     -- organizations의 org_code 변경 시 자동 업데이트

-- 3. 주석 수정 (잘못된 주석 정정)
COMMENT ON COLUMN rsms.management_obligations.org_code IS '조직코드 (FK → organizations.org_code)';

-- 4. 검증 쿼리
-- 외래키가 정상적으로 추가되었는지 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name = 'management_obligations'
  AND kcu.column_name = 'org_code';

-- =====================================================================================
-- 참고사항
-- =====================================================================================
-- 1. ON DELETE RESTRICT: 조직이 삭제되려면 먼저 관리의무 레코드를 삭제해야 함
--    (데이터 보존을 위한 안전장치)
--
-- 2. ON UPDATE CASCADE: 조직코드가 변경되면 관리의무의 org_code도 자동 업데이트
--    (참조 무결성 유지)
--
-- 3. 만약 ON DELETE CASCADE를 원한다면:
--    ALTER TABLE rsms.management_obligations
--      DROP CONSTRAINT fk_management_obligations_org_code;
--
--    ALTER TABLE rsms.management_obligations
--      ADD CONSTRAINT fk_management_obligations_org_code
--        FOREIGN KEY (org_code)
--        REFERENCES rsms.organizations(org_code)
--        ON DELETE CASCADE
--        ON UPDATE CASCADE;
-- =====================================================================================
