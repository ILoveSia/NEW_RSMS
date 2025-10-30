
-- =====================================================
-- 초기 권한(Permission) 데이터 삽입
-- =====================================================
-- 설명: 메뉴별 세밀한 권한 정의
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - RoleMgmt UI의 오른쪽 그리드에 표시되는 상세역할
--   - 각 메뉴에 대한 CRUD 권한 정의
--   - 업무 유형별 권한 분류: 업무/일반, 본점기본/영업점기본
-- =====================================================

-- 기존 데이터 초기화 (개발 환경에서만 사용, 운영 환경에서는 주석 처리)
-- TRUNCATE TABLE rsms.permissions RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. 대시보드 권한
-- =====================================================

INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P001', '대시보드조회', '대시보드 조회 권한',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'N',
  1, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '01';

-- =====================================================
-- 2. 책무구조도 원장 관리 권한
-- =====================================================

-- 2-1. 책무이행차수관리 (0201)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P101', '책무이행차수관리', '책무 이행 차수 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  101, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0201'
UNION ALL
SELECT
  'P102', '책무이행차수조회', '책무 이행 차수 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  102, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0201';

-- 2-2. 직책관리 (0202)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P103', '직책관리', '조직 직책 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  103, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0202'
UNION ALL
SELECT
  'P104', '직책조회', '직책 정보 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  104, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0202';

-- 2-3. 직책겸직관리 (0203)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P105', '직책겸직관리', '직책 겸직 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  105, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0203'
UNION ALL
SELECT
  'P106', '직책겸직조회', '직책 겸직 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  106, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0203';

-- 2-4. 회의체관리 (0204)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P107', '회의체관리', '회의체 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  107, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0204'
UNION ALL
SELECT
  'P108', '회의체조회', '회의체 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  108, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0204';

-- 2-5. 책무관리 (0205)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P109', '책무관리', '책무 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  109, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0205'
UNION ALL
SELECT
  'P110', '책무조회', '책무 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  110, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0205';

-- 2-6. 책무기술서관리 (0206)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P111', '책무기술서관리', '책무 기술서 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  111, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0206'
UNION ALL
SELECT
  'P112', '책무기술서조회', '책무 기술서 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  112, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0206';

-- 2-7. 임원정보관리 (0207)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P113', '임원정보관리', '임원 정보 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  113, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0207'
UNION ALL
SELECT
  'P114', '임원정보조회', '임원 정보 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  114, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0207';

-- 2-8. 부서장업무메뉴얼관리 (0208)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P115', '부서장업무메뉴얼관리', '부서장 업무 메뉴얼 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  115, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0208'
UNION ALL
SELECT
  'P116', '부서장업무메뉴얼조회', '부서장 업무 메뉴얼 조회 전용',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  116, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0208';

-- 2-9. 직책총괄관리의무조회 (0209)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P117', '직책총괄관리의무조회', '직책 총괄관리의무 조회',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  117, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0209';

-- =====================================================
-- 3. 책무구조도 관리 활동 권한
-- =====================================================

-- 3-1. 수행자지정 (0301)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P201', '수행자지정', '관리활동 수행자 지정',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  201, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0301';

-- 3-2. 관리활동 수행 (0302)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P202', '관리활동수행', '관리활동 수행 및 기록',
  m.menu_id,
  'Y', 'N', 'Y',
  'Y', 'Y', 'Y', 'N', 'Y',
  202, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0302';

-- 3-3. 업무메뉴얼조회 (0303)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P203', '업무메뉴얼조회', '업무 메뉴얼 조회',
  m.menu_id,
  'N', 'Y', 'Y',
  'Y', 'N', 'N', 'N', 'Y',
  203, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0303';

-- =====================================================
-- 4. 이행점검 관리 권한
-- =====================================================

-- 4-1. 기간설정 (0401)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P301', '점검기간설정', '이행점검 기간 설정',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  301, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0401';

-- 4-2. 점검자지정 (0402)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P302', '점검자지정', '점검자 지정 및 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  302, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0402';

-- 4-3. 점검수행 및 결재 (0403)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P303', '점검수행', '이행점검 수행 및 결재',
  m.menu_id,
  'Y', 'N', 'Y',
  'Y', 'Y', 'Y', 'N', 'Y',
  303, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0403';

-- 4-4. 반려관리 (0404)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P304', '반려관리', '점검 반려 사항 관리',
  m.menu_id,
  'Y', 'Y', 'Y',
  'Y', 'Y', 'Y', 'Y', 'Y',
  304, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0404';

-- =====================================================
-- 5. 이행점검보고서 권한
-- =====================================================

-- 5-1. 임원이행점검보고서 (0501)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P401', '임원보고서조회', '임원 이행점검 보고서 조회',
  m.menu_id,
  'N', 'Y', 'N',
  'Y', 'N', 'N', 'N', 'Y',
  401, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0501';

-- 5-2. CEO이행점검보고서 (0502)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P402', 'CEO보고서조회', 'CEO 이행점검 보고서 조회',
  m.menu_id,
  'N', 'Y', 'N',
  'Y', 'N', 'N', 'N', 'Y',
  402, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0502';

-- 5-3. 보고서목록 (0503)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P403', '보고서목록관리', '보고서 목록 조회 및 관리',
  m.menu_id,
  'Y', 'Y', 'Y',
  'Y', 'Y', 'Y', 'Y', 'Y',
  403, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0503';

-- =====================================================
-- 6. 개선이행 권한
-- =====================================================

-- 6-1. 관리활동/이행점검 개선이행 (0601)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P501', '종합개선이행', '관리활동/이행점검 개선이행',
  m.menu_id,
  'Y', 'Y', 'Y',
  'Y', 'Y', 'Y', 'Y', 'Y',
  501, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0601';

-- 6-2. 이행점검 보고서 개선이행 (0602)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P502', '보고서개선이행', '이행점검 보고서 개선이행',
  m.menu_id,
  'Y', 'Y', 'Y',
  'Y', 'Y', 'Y', 'Y', 'Y',
  502, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0602';

-- =====================================================
-- 7. 결재관리 권한
-- =====================================================

-- 7-1. 결재함 (0701)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P601', '결재함사용', '결재함 조회 및 결재 처리',
  m.menu_id,
  'Y', 'Y', 'Y',
  'Y', 'Y', 'Y', 'Y', 'Y',
  601, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0701';

-- 7-2. 결재선관리 (0702)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P602', '결재선관리', '결재선 설정 및 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  602, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0702';

-- =====================================================
-- 8. 시스템관리 권한
-- =====================================================

-- 8-1. 코드관리 (0801)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P701', '코드관리', '시스템 공통코드 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  701, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0801';

-- 8-2. 메뉴관리 (0802)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P702', '메뉴관리', '시스템 메뉴 구조 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  702, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0802';

-- 8-3. 역활관리 (0803)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P703', '역활관리', '시스템 역활 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  703, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0803';

-- 8-4. 사용자관리 (0804)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P704', '사용자관리', '사용자 계정 전체 관리',
  m.menu_id,
  'Y', 'Y', 'N',
  'Y', 'Y', 'Y', 'Y', 'Y',
  704, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0804';

-- 8-5. 접근로그 (0805)
INSERT INTO rsms.permissions (
  permission_code, permission_name, description,
  menu_id,
  business_permission, main_business_permission, execution_permission,
  can_view, can_create, can_update, can_delete, can_select,
  sort_order, is_active,
  created_by, updated_by
)
SELECT
  'P705', '접근로그조회', '시스템 접근 로그 조회',
  m.menu_id,
  'N', 'Y', 'N',
  'Y', 'N', 'N', 'N', 'Y',
  705, 'Y',
  'SYSTEM', 'SYSTEM'
FROM rsms.menu_items m
WHERE m.menu_code = '0805';

-- =====================================================
-- 결과 확인 쿼리
-- =====================================================
-- SELECT
--   p.permission_id,
--   p.permission_code,
--   p.permission_name,
--   m.menu_code,
--   m.menu_name,
--   CASE WHEN p.business_permission = 'Y' THEN '업무' ELSE '일반' END AS business_type,
--   CASE WHEN p.main_business_permission = 'Y' THEN 'O' ELSE '' END AS main_office,
--   CASE WHEN p.execution_permission = 'Y' THEN 'O' ELSE '' END AS branch_office,
--   CASE WHEN p.can_view = 'Y' THEN 'O' ELSE '' END AS view_perm,
--   CASE WHEN p.can_create = 'Y' THEN 'O' ELSE '' END AS create_perm,
--   CASE WHEN p.can_update = 'Y' THEN 'O' ELSE '' END AS update_perm,
--   CASE WHEN p.can_delete = 'Y' THEN 'O' ELSE '' END AS delete_perm,
--   CASE WHEN p.can_select = 'Y' THEN 'O' ELSE '' END AS select_perm,
--   p.sort_order
-- FROM rsms.permissions p
-- INNER JOIN rsms.menu_items m ON p.menu_id = m.menu_id
-- ORDER BY p.sort_order;

-- 스크립트 완료

-- =====================================================
-- 권한 요약
-- =====================================================
-- 1. 대시보드: 1개 권한
-- 2. 책무구조도 원장 관리: 17개 권한 (각 메뉴별 관리+조회)
-- 3. 책무구조도 관리 활동: 3개 권한
-- 4. 이행점검 관리: 4개 권한
-- 5. 이행점검보고서: 3개 권한
-- 6. 개선이행: 2개 권한
-- 7. 결재관리: 2개 권한
-- 8. 시스템관리: 5개 권한
--
-- 총 37개 메뉴별 권한
-- =====================================================
