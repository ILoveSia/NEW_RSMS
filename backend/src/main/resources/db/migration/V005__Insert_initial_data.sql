-- =====================================================================================
-- V005: 초기 데이터 삽입
-- =====================================================================================
-- 설명:
--   - 초기 역할 데이터 (roles)
--   - 초기 메뉴 데이터 (menu_items)
--   - 초기 권한 데이터 (permissions)
--   - 관리자 계정 생성 (admin 사용자)
-- 작성일: 2025-10-28
-- Flyway 마이그레이션: V005
-- 참조: database/scripts/24~27
-- =====================================================================================



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

-- =====================================================
-- 초기 메뉴(MenuItems) 데이터 삽입
-- =====================================================
-- 설명: RSMS 시스템 전체 메뉴 트리 구조 생성
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - menuData.ts 파일 구조 기반
--   - LeftMenu에 표시되는 전체 메뉴
--   - 3단계 계층 구조: 대분류(depth=1) → 중분류(depth=2) → 소분류(depth=3)
-- =====================================================

-- 기존 데이터 초기화 (개발 환경에서만 사용, 운영 환경에서는 주석 처리)
-- TRUNCATE TABLE rsms.menu_items RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. 대시보드 (01)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 01. 대시보드 (페이지 - 단일 메뉴)
(
  '01', '대시보드', '시스템 대시보드', '/app/dashboard', '',
  'page', 1, NULL, 1, 'DASHBOARD_MAIN', 'Dashboard',
  'Y', 'N', 'Y', 'N', 'Y',
  '관리자', '관리자'
);

-- =====================================================
-- 2. 책무구조도 원장 관리 (02)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 02. 책무구조도 원장 관리 (폴더)
(
  '02', '책무구조도 원장 관리', '책무구조도 원장 관리 메인', '', '',
  'folder', 1, NULL, 2, 'RESP_LEDGER', 'FolderOpen',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0201. 책무이행차수관리
(
  '0201', '책무이행차수관리', '책무 이행 차수 관리', '/app/resps/ledgermgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 1, 'LEDGER_MGMT', 'Assignment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0202. 직책관리
(
  '0202', '직책관리', '조직 직책 관리', '/app/resps/positionmgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 2, 'POSITION_MGMT', 'Person',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0203. 직책겸직관리
(
  '0203', '직책겸직관리', '직책 겸직 관리', '/app/resps/positiondualmgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 3, 'POSITION_DUAL_MGMT', 'GroupWork',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0204. 회의체관리
(
  '0204', '회의체관리', '회의체 관리', '/app/resps/deliberativemgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 4, 'DELIBERATIVE_MGMT', 'Groups',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0205. 책무관리
(
  '0205', '책무관리', '책무 관리', '/app/resps/responsibilitymgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 5, 'RESPONSIBILITY_MGMT', 'Assignment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0206. 책무기술서관리
(
  '0206', '책무기술서관리', '책무 기술서 관리', '/app/resps/responsibilitydocmgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 6, 'RESPONSIBILITY_DOC_MGMT', 'Description',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0207. 임원정보관리
(
  '0207', '임원정보관리', '임원 정보 관리', '/app/resps/officerinfomgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 7, 'OFFICER_INFO_MGMT', 'Person',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0208. 부서장업무메뉴얼관리
(
  '0208', '부서장업무메뉴얼관리', '부서장 업무 메뉴얼 관리', '/app/resps/deptopmanualsmgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 8, 'DEPT_OP_MANUALS_MGMT', 'MenuBook',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0209. 직책총괄관리의무조회
(
  '0209', '직책총괄관리의무조회', '직책 총괄관리의무 조회', '/app/resps/ceomgmtdutysearch', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '02' LIMIT 1), 9, 'CEO_MGMT_DUTY_SEARCH', 'Search',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 3. 책무구조도 관리 활동 (03)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 03. 책무구조도 관리 활동 (폴더)
(
  '03', '책무구조도 관리 활동', '책무구조도 관리 활동', '', '',
  'folder', 1, NULL, 3, 'RESP_ACTIVITY', 'Assignment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0301. 수행자지정
(
  '0301', '수행자지정', '관리활동 수행자 지정', '/app/activity/performer-assignment', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '03' LIMIT 1), 1, 'PERFORMER_ASSIGNMENT', 'AssignmentInd',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0302. 관리활동 수행
(
  '0302', '관리활동 수행', '관리활동 수행', '/app/activity/execution', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '03' LIMIT 1), 2, 'ACTIVITY_EXECUTION', 'PlayArrow',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0303. 업무메뉴얼조회
(
  '0303', '업무메뉴얼조회', '업무 메뉴얼 조회', '/app/activity/manual-inquiry', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '03' LIMIT 1), 3, 'MANUAL_INQUIRY', 'FindInPage',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 4. 이행점검 관리 (04)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 04. 이행점검 관리 (폴더)
(
  '04', '이행점검 관리', '이행점검 관리', '', '',
  'folder', 1, NULL, 4, 'COMPLIANCE', 'Assessment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0401. 기간설정
(
  '0401', '기간설정', '점검 기간 설정', '/app/compliance/period-setting', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '04' LIMIT 1), 1, 'PERIOD_SETTING', 'DateRange',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0402. 점검자지정
(
  '0402', '점검자지정', '점검자 지정', '/app/compliance/inspector-assignment', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '04' LIMIT 1), 2, 'INSPECTOR_ASSIGNMENT', 'PersonAdd',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0403. 점검수행 및 결재
(
  '0403', '점검수행 및 결재', '점검 수행 및 결재', '/app/compliance/execution-approval', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '04' LIMIT 1), 3, 'EXECUTION_APPROVAL', 'Rule',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0404. 반려관리
(
  '0404', '반려관리', '반려 관리', '/app/compliance/rejection-management', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '04' LIMIT 1), 4, 'REJECTION_MGMT', 'ThumbDown',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 5. 이행점검보고서 (05)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 05. 이행점검보고서 (폴더)
(
  '05', '이행점검보고서', '이행점검보고서', '', '',
  'folder', 1, NULL, 5, 'REPORTS', 'Description',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0501. 임원이행점검보고서
(
  '0501', '임원이행점검보고서', '임원 이행점검 보고서', '/app/reports/executive-report', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '05' LIMIT 1), 1, 'EXECUTIVE_REPORT', 'Assessment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0502. CEO이행점검보고서
(
  '0502', 'CEO이행점검보고서', 'CEO 이행점검 보고서', '/app/reports/ceo-report', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '05' LIMIT 1), 2, 'CEO_REPORT', 'Assessment',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0503. 보고서목록
(
  '0503', '보고서목록', '보고서 목록', '/app/reports/report-list', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '05' LIMIT 1), 3, 'REPORT_LIST', 'List',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 6. 개선이행 (06)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 06. 개선이행 (폴더)
(
  '06', '개선이행', '개선이행', '', '',
  'folder', 1, NULL, 6, 'IMPROVEMENT', 'TrendingUp',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0601. 관리활동/이행점검 개선이행
(
  '0601', '관리활동/이행점검 개선이행', '관리활동/이행점검 개선이행', '/app/improvement/activity-compliance', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '06' LIMIT 1), 1, 'ACTIVITY_COMPLIANCE', 'TrendingUp',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0602. 이행점검 보고서 개선이행
(
  '0602', '이행점검 보고서 개선이행', '이행점검 보고서 개선이행', '/app/improvement/report', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '06' LIMIT 1), 2, 'REPORT_IMPROVEMENT', 'AutoFixHigh',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 7. 결재관리 (07)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 07. 결재관리 (폴더)
(
  '07', '결재관리', '결재관리', '', '',
  'folder', 1, NULL, 7, 'APPROVAL', 'Approval',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0701. 결재함
(
  '0701', '결재함', '결재함', '/app/approval/box', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '07' LIMIT 1), 1, 'APPROVAL_BOX', 'MarkunreadMailbox',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0702. 결재선관리
(
  '0702', '결재선관리', '결재선 관리', '/app/approval/line', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '07' LIMIT 1), 2, 'APPROVAL_LINE', 'Timeline',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 8. 시스템관리 (08)
-- =====================================================

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 08. 시스템관리 (폴더)
(
  '08', '시스템관리', '시스템 관리', '', '',
  'folder', 1, NULL, 8, 'SYSTEM', 'Settings',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

INSERT INTO rsms.menu_items (
  menu_code, menu_name, description, url, parameters,
  menu_type, depth, parent_id, sort_order, system_code, icon,
  is_active, is_test_page, requires_auth, open_in_new_window, dashboard_layout,
  created_by, updated_by
) VALUES
-- 0801. 코드관리
(
  '0801', '코드관리', '시스템 공통코드 관리', '/app/settings/system/code-mgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '08' LIMIT 1), 1, 'CODE_MGMT', 'Code',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0802. 메뉴관리
(
  '0802', '메뉴관리', '시스템 메뉴 관리', '/app/settings/system/menu-mgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '08' LIMIT 1), 2, 'MENU_MGMT', 'Menu',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0803. 역활관리
(
  '0803', '역활관리', '시스템 역활 관리', '/app/settings/system/role-mgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '08' LIMIT 1), 3, 'ROLE_MGMT', 'AdminPanelSettings',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0804. 사용자관리
(
  '0804', '사용자관리', '사용자 관리', '/app/settings/system/user-mgmt', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '08' LIMIT 1), 4, 'USER_MGMT', 'Person',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
),
-- 0805. 접근로그
(
  '0805', '접근로그', '시스템 접근 로그', '/app/settings/system/access-log', '',
  'page', 2, (SELECT menu_id FROM rsms.menu_items WHERE menu_code = '08' LIMIT 1), 5, 'ACCESS_LOG', 'History',
  'Y', 'N', 'Y', 'N', 'N',
  '관리자', '관리자'
);

-- =====================================================
-- 결과 확인 쿼리
-- =====================================================
-- SELECT
--   m.menu_id,
--   m.menu_code,
--   m.menu_name,
--   m.description,
--   m.url,
--   m.menu_type,
--   m.depth,
--   pm.menu_name AS parent_menu_name,
--   m.sort_order,
--   m.icon,
--   m.is_active,
--   m.created_at
-- FROM rsms.menu_items m
-- LEFT JOIN rsms.menu_items pm ON m.parent_id = pm.menu_id
-- ORDER BY m.depth, m.sort_order;

-- 스크립트 완료

-- =====================================================
-- 메뉴 구조 요약 (menuData.ts 기준)
-- =====================================================
-- 01. 대시보드 (단일 페이지)
-- 02. 책무구조도 원장 관리 (9개)
--     - 책무이행차수관리, 직책관리, 직책겸직관리, 회의체관리,
--       책무관리, 책무기술서관리, 임원정보관리,
--       부서장업무메뉴얼관리, 직책총괄관리의무조회
-- 03. 책무구조도 관리 활동 (3개)
--     - 수행자지정, 관리활동 수행, 업무메뉴얼조회
-- 04. 이행점검 관리 (4개)
--     - 기간설정, 점검자지정, 점검수행 및 결재, 반려관리
-- 05. 이행점검보고서 (3개)
--     - 임원이행점검보고서, CEO이행점검보고서, 보고서목록
-- 06. 개선이행 (2개)
--     - 관리활동/이행점검 개선이행, 이행점검 보고서 개선이행
-- 07. 결재관리 (2개)
--     - 결재함, 결재선관리
-- 08. 시스템관리 (5개)
--     - 코드관리, 메뉴관리, 역활관리, 사용자관리, 접근로그
--
-- 총 8개 대분류, 29개 페이지
-- =====================================================

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
  failed_login_count, locked_until,
  is_admin, is_executive, auth_level,
  is_login_blocked, is_active,
  timezone, language,
  created_by, updated_by
) VALUES
-- 슈퍼 관리자 계정 (emp_no NULL: 시스템 계정)
(
  'admin',
  -- BCrypt 해시: admin123! (강도 12)
  -- 주의: 운영 환경에서는 반드시 비밀번호 변경 필요
  '$2a$12$9EjEA3LvXY9rf/1XS739Zud7Tol45alg63P7NF/m8NTetegXvDt.6',
  NULL,  -- emp_no NULL: 시스템 계정 (employees 테이블 불필요)
  'ACTIVE',           -- 계정 상태: 활성화
  'Y',                -- 최초 로그인 시 비밀번호 변경 필요
  0,                  -- 로그인 실패 횟수: 0으로 초기화
  NULL,               -- 계정 잠금 시간: NULL (잠금 없음)
  'Y',                -- 관리자
  'N',                -- 임원 아님
  10,                 -- 최고 권한 레벨
  'N',                -- 로그인 차단 안함
  'Y',                -- 활성화
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
