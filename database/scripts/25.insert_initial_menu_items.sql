
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
