-- =====================================================================================
-- positions_details 테이블 외래키 제약조건 추가
-- =====================================================================================
-- 설명: org_code 컬럼에 organizations 테이블로의 외래키 제약조건 추가
-- 작성일: 2025-10-27
-- 목적: 데이터 무결성 보장 및 참조 무결성 강화
-- =====================================================================================

-- 1. 기존 데이터 검증 (잘못된 org_code가 있는지 확인)
SELECT pd.positions_details_id, pd.org_code, pd.hq_code
FROM rsms.positions_details pd
LEFT JOIN rsms.organizations o ON pd.org_code = o.org_code
WHERE o.org_code IS NULL;

-- 2. 외래키 제약조건 추가
ALTER TABLE rsms.positions_details
  ADD CONSTRAINT fk_positions_details_org_code
    FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code)
    ON DELETE RESTRICT     -- organizations 삭제 시 positions_details에 레코드가 있으면 삭제 불가
    ON UPDATE CASCADE;     -- organizations의 org_code 변경 시 자동 업데이트

-- 3. 검증 쿼리
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
  AND tc.table_name = 'positions_details'
  AND kcu.column_name = 'org_code';

-- =====================================================================================
-- 참고사항
-- =====================================================================================
-- 1. ON DELETE RESTRICT: 조직이 삭제되려면 먼저 직책상세 레코드를 삭제해야 함
-- 2. ON UPDATE CASCADE: 조직코드가 변경되면 직책상세의 org_code도 자동 업데이트
-- =====================================================================================
