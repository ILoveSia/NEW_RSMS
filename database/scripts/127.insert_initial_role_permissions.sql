
-- =====================================================
-- 초기 역할-권한 매핑 데이터 삽입 (role_permissions)
-- =====================================================
-- 설명: 역할에 권한을 할당하는 매핑 데이터
-- 작성자: Claude AI
-- 작성일: 2025-12-04
-- 참고:
--   - RoleMgmt UI 오른쪽 그리드에 표시되는 상세역할
--   - 역할별로 필요한 권한을 매핑
-- =====================================================

-- 기존 데이터 초기화 (개발 환경에서만 사용)
-- TRUNCATE TABLE rsms.role_permissions RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. CEO (001) - 모든 권한 할당
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '001'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 2. 최고관리자/준법감시인 (002) - 모든 권한 할당
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '002'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 3. 관리자/준법감시자 (101) - 관리 권한 할당
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '101'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P101', 'P102',  -- 책무이행차수
    'P103', 'P104',  -- 직책관리
    'P105', 'P106',  -- 직책겸직관리
    'P107', 'P108',  -- 회의체관리
    'P109', 'P110',  -- 책무관리
    'P111', 'P112',  -- 책무기술서관리
    'P113', 'P114',  -- 임원정보관리
    'P115', 'P116',  -- 부서장업무메뉴얼관리
    'P117',          -- 직책총괄관리의무조회
    'P201', 'P202', 'P203',  -- 관리활동
    'P301', 'P302', 'P303', 'P304',  -- 이행점검
    'P401', 'P402', 'P403',  -- 이행점검보고서
    'P501', 'P502',  -- 개선이행
    'P601', 'P602'   -- 결재관리
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 4. 관리자/내부통제관리자 (102) - 내부통제 관련 권한
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '102'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P101', 'P102',  -- 책무이행차수
    'P103', 'P104',  -- 직책관리
    'P109', 'P110',  -- 책무관리
    'P111', 'P112',  -- 책무기술서관리
    'P117',          -- 직책총괄관리의무조회
    'P201', 'P202', 'P203',  -- 관리활동
    'P301', 'P302', 'P303', 'P304',  -- 이행점검
    'P401', 'P402', 'P403',  -- 이행점검보고서
    'P501', 'P502',  -- 개선이행
    'P601', 'P602'   -- 결재관리
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 5. 관리자/시스템관리자 (103) - 시스템 관리 권한
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '103'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P701', 'P702', 'P703', 'P704', 'P705'  -- 시스템관리
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 6. 임원 (201) - 조회 및 결재 권한
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '201'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P102', 'P104', 'P106', 'P108', 'P110', 'P112', 'P114', 'P116', 'P117',  -- 원장 조회
    'P202', 'P203',  -- 관리활동 수행/조회
    'P303', 'P304',  -- 점검수행 및 결재
    'P401', 'P402', 'P403',  -- 이행점검보고서
    'P501', 'P502',  -- 개선이행
    'P601'           -- 결재함
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 7. 부서장 (202) - 부서 관리 권한
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '202'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P102', 'P104', 'P106', 'P108', 'P110', 'P112', 'P116', 'P117',  -- 원장 조회
    'P202', 'P203',  -- 관리활동 수행/조회
    'P303',          -- 점검수행
    'P401', 'P403',  -- 이행점검보고서 조회
    'P501',          -- 개선이행
    'P601'           -- 결재함
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 8. 일반 사용자 (801) - 기본 조회 권한
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '801'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P102', 'P104', 'P110', 'P112', 'P117',  -- 원장 조회
    'P202', 'P203',  -- 관리활동 수행/조회
    'P303'           -- 점검수행
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 9. 조회 전용 사용자 (802) - 조회만 가능
-- =====================================================
INSERT INTO rsms.role_permissions (role_id, permission_id, granted, assigned_by, created_by, updated_by)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '802'
  AND r.is_deleted = 'N'
  AND p.is_deleted = 'N'
  AND p.permission_code IN (
    'P001',  -- 대시보드조회
    'P102', 'P104', 'P110', 'P112', 'P117',  -- 원장 조회
    'P203'   -- 업무메뉴얼조회
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 10. 게스트/Any (999) - 권한 없음
-- =====================================================
-- Any 역할은 권한을 할당하지 않음

-- =====================================================
-- 결과 확인 쿼리
-- =====================================================
-- SELECT
--   r.role_code,
--   r.role_name,
--   COUNT(rp.permission_id) AS permission_count
-- FROM rsms.roles r
-- LEFT JOIN rsms.role_permissions rp ON r.role_id = rp.role_id AND rp.is_deleted = 'N' AND rp.granted = 'Y'
-- WHERE r.is_deleted = 'N'
-- GROUP BY r.role_id, r.role_code, r.role_name
-- ORDER BY r.sort_order;

-- 스크립트 완료
