
-- =====================================================
-- 초기 역할(Role) 데이터 삽입
-- =====================================================
-- 설명: 기본 역할 4개 생성 (Administrator, Manager, User, Any)
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - RoleMgmt UI의 왼쪽 그리드에 표시되는 기본 역할
--   - parent_role_id를 통한 역할 계층 구조
--   - 시스템 역할은 is_system_role = 'Y'로 설정
-- =====================================================

-- 기존 데이터 초기화 (개발 환경에서만 사용, 운영 환경에서는 주석 처리)
-- TRUNCATE TABLE rsms.roles RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. 최고 관리자 역할들
-- =====================================================

INSERT INTO rsms.roles (
  role_code, role_name, description, role_type, role_category, parent_role_id,
  is_system_role, status, sort_order,
  created_by, updated_by
) VALUES
-- 001. CEO
(
  '001', 'CEO', 'CEO / 대표이사',
  'SYSTEM', '최고관리자', NULL,
  'Y', 'ACTIVE', 1,
  'SYSTEM', 'SYSTEM'
),

-- 002. 최고 관리자 (준법감시인)
(
  '002', '최고관리자/준법감시인', '최고 관리자 / 준법감시인',
  'SYSTEM', '최고관리자', NULL,
  'Y', 'ACTIVE', 2,
  'SYSTEM', 'SYSTEM'
);

-- =====================================================
-- 2. 관리자 역할들
-- =====================================================

INSERT INTO rsms.roles (
  role_code, role_name, description, role_type, role_category, parent_role_id,
  is_system_role, status, sort_order,
  created_by, updated_by
) VALUES
-- 101. 관리자 (준법감시자)
(
  '101', '관리자/준법감시자', '관리자 / 준법감시자',
  'SYSTEM', '관리자', NULL,
  'Y', 'ACTIVE', 101,
  'SYSTEM', 'SYSTEM'
),

-- 102. 관리자 (내부통제관리자)
(
  '102', '관리자/내부통제관리자', '관리자 / 내부통제관리자',
  'SYSTEM', '관리자', NULL,
  'Y', 'ACTIVE', 102,
  'SYSTEM', 'SYSTEM'
),

-- 103. 관리자 (시스템관리자)
(
  '103', '관리자/시스템관리자', '관리자 / 시스템 관리자',
  'SYSTEM', '관리자', NULL,
  'Y', 'ACTIVE', 103,
  'SYSTEM', 'SYSTEM'
);

-- =====================================================
-- 3. 임원 역할들
-- =====================================================

INSERT INTO rsms.roles (
  role_code, role_name, description, role_type, role_category, parent_role_id,
  is_system_role, status, sort_order,
  created_by, updated_by
) VALUES
-- 201. 임원
(
  '201', '임원', '임원 (이사, 감사 등)',
  'SYSTEM', '관리자', NULL,
  'Y', 'ACTIVE', 201,
  'SYSTEM', 'SYSTEM'
),

-- 202. 부서장
(
  '202', '부서장', '부서장 (본부장, 팀장 등)',
  'SYSTEM', '관리자', (SELECT role_id FROM rsms.roles WHERE role_code = '201' LIMIT 1),
  'Y', 'ACTIVE', 202,
  'SYSTEM', 'SYSTEM'
);

-- =====================================================
-- 4. 사용자 역할들
-- =====================================================

INSERT INTO rsms.roles (
  role_code, role_name, description, role_type, role_category, parent_role_id,
  is_system_role, status, sort_order,
  created_by, updated_by
) VALUES
-- 801. 일반 사용자
(
  '801', '사용자/기본사용자', '일반 사용자 / 기본 사용자',
  'SYSTEM', '사용자', NULL,
  'Y', 'ACTIVE', 801,
  'SYSTEM', 'SYSTEM'
),

-- 802. 조회 전용 사용자
(
  '802', '사용자/조회전용', '조회 전용 사용자',
  'SYSTEM', '사용자', (SELECT role_id FROM rsms.roles WHERE role_code = '801' LIMIT 1),
  'Y', 'ACTIVE', 802,
  'SYSTEM', 'SYSTEM'
);

-- =====================================================
-- 5. 특수 역할
-- =====================================================

INSERT INTO rsms.roles (
  role_code, role_name, description, role_type, role_category, parent_role_id,
  is_system_role, status, sort_order,
  created_by, updated_by
) VALUES
-- 999. 게스트 (권한 없음)
(
  '999', 'Any', '게스트 / 미인증 사용자',
  'SYSTEM', '사용자', NULL,
  'Y', 'ACTIVE', 999,
  'SYSTEM', 'SYSTEM'
);

-- =====================================================
-- 결과 확인 쿼리
-- =====================================================
-- SELECT
--   r.role_id,
--   r.role_code,
--   r.role_name,
--   r.description,
--   r.role_type,
--   r.role_category,
--   pr.role_name AS parent_role_name,
--   r.is_system_role,
--   r.status,
--   r.sort_order,
--   r.created_at
-- FROM rsms.roles r
-- LEFT JOIN rsms.roles pr ON r.parent_role_id = pr.role_id
-- ORDER BY r.sort_order;

-- 스크립트 완료

-- =====================================================
-- 역할 계층 구조
-- =====================================================
-- 001. CEO (최고 레벨)
-- 002. 최고관리자/준법감시인 (최고 레벨)
--
-- 101. 관리자/준법감시자
-- 102. 관리자/내부통제관리자
-- 103. 관리자/시스템관리자
--
-- 201. 임원
--   └─ 202. 부서장
--
-- 801. 사용자/기본사용자
--   └─ 802. 사용자/조회전용
--
-- 999. Any (게스트)
-- =====================================================
