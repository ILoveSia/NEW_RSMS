
-- =====================================================
-- 관리자 계정 생성 및 권한 할당
-- =====================================================
-- 설명: 시스템 초기 관리자 계정 생성 및 전체 권한 부여
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - 기본 관리자 계정: admin / admin123!
--   - BCrypt 비밀번호 해싱 (강도 12)
--   - 모든 메뉴에 대한 전체 권한 부여
--   - 운영 환경에서는 비밀번호 즉시 변경 필수
-- =====================================================

-- =====================================================
-- 1. 관리자 사용자 생성
-- =====================================================

INSERT INTO rsms.users (
  username, password_hash, emp_no,
  account_status, password_change_required,
  is_admin, is_executive, auth_level,
  is_login_blocked, is_active,
  timezone, language,
  created_by, updated_by
) VALUES
-- 슈퍼 관리자 계정
(
  'admin',
  -- BCrypt 해시: admin123! (강도 12)
  -- 주의: 운영 환경에서는 반드시 비밀번호 변경 필요
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIW.hALSVy',
  'ADMIN001',
  'ACTIVE',
  'Y',  -- 최초 로그인 시 비밀번호 변경 필요
  'Y',  -- 관리자
  'N',  -- 임원 아님
  10,   -- 최고 권한 레벨
  'N',  -- 로그인 차단 안함
  'Y',  -- 활성화
  'Asia/Seoul',
  'ko',
  'SYSTEM',
  'SYSTEM'
);

-- =====================================================
-- 2. 관리자에게 역할 할당
-- =====================================================

-- 최고관리자 역할 할당
INSERT INTO rsms.user_roles (
  user_id, role_id, assigned_at, assigned_by, is_active,
  created_by, updated_by
)
SELECT
  u.user_id,
  r.role_id,
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'Y',
  'SYSTEM',
  'SYSTEM'
FROM rsms.users u
CROSS JOIN rsms.roles r
WHERE u.username = 'admin'
  AND r.role_code = '002';  -- 최고관리자/준법감시인

-- 시스템관리자 역할 추가
INSERT INTO rsms.user_roles (
  user_id, role_id, assigned_at, assigned_by, is_active,
  created_by, updated_by
)
SELECT
  u.user_id,
  r.role_id,
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'Y',
  'SYSTEM',
  'SYSTEM'
FROM rsms.users u
CROSS JOIN rsms.roles r
WHERE u.username = 'admin'
  AND r.role_code = '103';  -- 관리자/시스템관리자

-- =====================================================
-- 3. 역할에 권한 할당
-- =====================================================

-- 최고관리자 역할에 모든 권한 부여
INSERT INTO rsms.role_permissions (
  role_id, permission_id, granted, assigned_at, assigned_by,
  created_by, updated_by
)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
WHERE r.role_code = '002';  -- 최고관리자/준법감시인

-- 시스템관리자 역할에 시스템 권한 부여
INSERT INTO rsms.role_permissions (
  role_id, permission_id, granted, assigned_at, assigned_by,
  created_by, updated_by
)
SELECT
  r.role_id,
  p.permission_id,
  'Y',
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.permissions p
INNER JOIN rsms.menu_items m ON p.menu_id = m.menu_id
WHERE r.role_code = '103'  -- 관리자/시스템관리자
  AND m.menu_code LIKE '08%';  -- 시스템 관리 메뉴 (08xx)

-- =====================================================
-- 4. 모든 메뉴에 대한 전체 CRUD 권한 부여
-- =====================================================

-- 최고관리자 역할에 모든 메뉴 접근 권한 부여
INSERT INTO rsms.menu_permissions (
  role_id, menu_id,
  can_view, can_create, can_update, can_delete, can_select,
  assigned_at, assigned_by,
  created_by, updated_by
)
SELECT
  r.role_id,
  m.menu_id,
  'Y',  -- 조회
  'Y',  -- 등록
  'Y',  -- 수정
  'Y',  -- 삭제
  'Y',  -- 선택
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.menu_items m
WHERE r.role_code = '002'  -- 최고관리자/준법감시인
  AND m.menu_type = 'page';  -- 페이지만 권한 부여 (폴더 제외)

-- 시스템관리자 역할에 시스템 관리 메뉴 접근 권한 부여
INSERT INTO rsms.menu_permissions (
  role_id, menu_id,
  can_view, can_create, can_update, can_delete, can_select,
  assigned_at, assigned_by,
  created_by, updated_by
)
SELECT
  r.role_id,
  m.menu_id,
  'Y',  -- 조회
  'Y',  -- 등록
  'Y',  -- 수정
  CASE WHEN m.menu_code IN ('0801', '0802') THEN 'N' ELSE 'Y' END,  -- 사용자/메뉴 관리는 삭제 제한
  'Y',  -- 선택
  CURRENT_TIMESTAMP,
  'SYSTEM',
  'SYSTEM',
  'SYSTEM'
FROM rsms.roles r
CROSS JOIN rsms.menu_items m
WHERE r.role_code = '103'  -- 관리자/시스템관리자
  AND m.menu_type = 'page'
  AND m.menu_code LIKE '08%';  -- 시스템 관리 메뉴만

-- =====================================================
-- 5. 결과 확인 쿼리
-- =====================================================
-- -- 관리자 계정 확인
-- SELECT
--   u.user_id,
--   u.username,
--   u.full_name,
--   u.email,
--   u.department,
--   u.account_status,
--   u.is_active,
--   STRING_AGG(r.role_name, ', ') AS roles
-- FROM rsms.users u
-- LEFT JOIN rsms.user_roles ur ON u.user_id = ur.user_id AND ur.is_active = 'Y'
-- LEFT JOIN rsms.roles r ON ur.role_id = r.role_id
-- WHERE u.username = 'admin'
-- GROUP BY u.user_id, u.username, u.full_name, u.email, u.department, u.account_status, u.is_active;
--
-- -- 관리자 권한 확인
-- SELECT
--   r.role_name,
--   COUNT(DISTINCT rp.permission_id) AS permission_count,
--   COUNT(DISTINCT mp.menu_id) AS menu_count
-- FROM rsms.roles r
-- LEFT JOIN rsms.role_permissions rp ON r.role_id = rp.role_id AND rp.granted = 'Y'
-- LEFT JOIN rsms.menu_permissions mp ON r.role_id = mp.role_id
-- WHERE r.role_code IN ('002', '103')
-- GROUP BY r.role_id, r.role_name
-- ORDER BY r.role_code;

-- 스크립트 완료

-- =====================================================
-- 운영 가이드
-- =====================================================
-- 1. 최초 로그인
--    - Username: admin
--    - Password: admin123!
--    - 로그인 후 즉시 비밀번호 변경 필요
--
-- 2. 비밀번호 변경 방법
--    - 사용자관리 메뉴에서 변경
--    - 또는 SQL: UPDATE rsms.users SET password_hash = '[새로운 BCrypt 해시]' WHERE username = 'admin';
--
-- 3. BCrypt 비밀번호 해시 생성
--    - Java: BCrypt.hashpw("password", BCrypt.gensalt(12));
--    - Spring Security: passwordEncoder.encode("password");
--    - Online Tool: https://bcrypt-generator.com/ (개발 환경만 사용)
--
-- 4. 보안 체크리스트
--    - [ ] 운영 환경 배포 전 admin 비밀번호 변경
--    - [ ] password_change_required = 'Y' 확인
--    - [ ] 불필요한 권한 제거
--    - [ ] 접근 로그 모니터링 설정
-- =====================================================
