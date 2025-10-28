-- =====================================================================================
-- CASCADE 제약조건 확인 스크립트
-- =====================================================================================
-- 설명: responsibilities 테이블 삭제 시 연결된 테이블들의 CASCADE 설정 확인
-- 작성일: 2025-10-27
-- =====================================================================================

-- 1. responsibility_details 테이블의 외래키 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name = 'responsibility_details'
  AND kcu.column_name = 'responsibility_id';

-- 예상 결과:
-- constraint_name: fk_responsibility_details_responsibility
-- table_name: responsibility_details
-- column_name: responsibility_id
-- foreign_table_name: responsibilities
-- foreign_column_name: responsibility_id
-- delete_rule: CASCADE  ← 이것이 중요!
-- update_rule: NO ACTION 또는 CASCADE

-- 2. management_obligations 테이블의 외래키 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'rsms'
  AND tc.table_name = 'management_obligations'
  AND kcu.column_name = 'responsibility_detail_id';

-- 예상 결과:
-- constraint_name: fk_management_obligations_resp_detail
-- table_name: management_obligations
-- column_name: responsibility_detail_id
-- foreign_table_name: responsibility_details
-- foreign_column_name: responsibility_detail_id
-- delete_rule: CASCADE  ← 이것이 중요!
-- update_rule: NO ACTION 또는 CASCADE

-- =====================================================================================
-- CASCADE 동작 테스트 (선택사항 - 주의해서 사용)
-- =====================================================================================
/*
-- 테스트용 데이터 삽입
BEGIN;

-- 1. 책무 생성
INSERT INTO rsms.responsibilities (ledger_order_id, positions_id, responsibility_info, is_active, created_by, updated_by)
VALUES ('TEST_ORDER', 1, '테스트 책무', 'Y', 'TEST', 'TEST')
RETURNING responsibility_id;
-- 결과 ID를 메모 (예: 999)

-- 2. 책무세부 생성
INSERT INTO rsms.responsibility_details (responsibility_id, responsibility_detail_info, is_active, created_by, updated_by)
VALUES (999, '테스트 책무세부', 'Y', 'TEST', 'TEST')
RETURNING responsibility_detail_id;
-- 결과 ID를 메모 (예: 888)

-- 3. 관리의무 생성
INSERT INTO rsms.management_obligations (
  responsibility_detail_id,
  obligation_major_cat_cd,
  obligation_middle_cat_cd,
  obligation_cd,
  obligation_info,
  org_code,
  is_active,
  created_by,
  updated_by
)
VALUES (888, 'TEST_MAJOR', 'TEST_MIDDLE', 'TEST_CODE', '테스트 관리의무', 'HEAD1010', 'Y', 'TEST', 'TEST');

-- 4. 데이터 확인
SELECT * FROM rsms.responsibilities WHERE responsibility_id = 999;
SELECT * FROM rsms.responsibility_details WHERE responsibility_id = 999;
SELECT * FROM rsms.management_obligations WHERE responsibility_detail_id = 888;

-- 5. 책무 삭제 (CASCADE 테스트)
DELETE FROM rsms.responsibilities WHERE responsibility_id = 999;

-- 6. CASCADE 동작 확인 (모두 삭제되어야 함)
SELECT COUNT(*) as remaining_details FROM rsms.responsibility_details WHERE responsibility_id = 999;
-- 결과: 0이어야 함

SELECT COUNT(*) as remaining_obligations FROM rsms.management_obligations WHERE responsibility_detail_id = 888;
-- 결과: 0이어야 함

ROLLBACK;  -- 테스트 데이터 롤백
*/

-- =====================================================================================
-- 참고사항
-- =====================================================================================
-- 1. delete_rule이 'CASCADE'가 아니면 외래키 제약조건을 다시 생성해야 함
-- 2. CASCADE 동작:
--    responsibilities 삭제 → responsibility_details 자동 삭제 → management_obligations 자동 삭제
-- 3. 운영 환경에서는 CASCADE 동작 전에 반드시 백업 필요
-- =====================================================================================
