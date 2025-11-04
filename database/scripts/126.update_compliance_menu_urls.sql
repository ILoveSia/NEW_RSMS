
-- =====================================================
-- 이행점검 관리 메뉴 URL 업데이트
-- =====================================================
-- 설명: PeriodSetting → ImplMonitoring 폴더명 변경에 따른 메뉴 URL 업데이트
-- 작성자: Claude AI
-- 작성일: 2025-11-03
-- 변경 내용:
--   1. 기간설정 → 이행점검계획 (period-setting → impl-monitoring)
--   2. 점검자지정 URL 통일 (inspector-assignment → inspector-assign)
--   3. 점검수행 및 결재 → 이행점검현황 (execution-approval → impl-monitoring-status)
-- =====================================================

-- 0401. 기간설정 → 이행점검계획
UPDATE rsms.menu_items
SET
  menu_name = '이행점검계획',
  description = '이행점검 계획 관리',
  url = '/app/compliance/impl-monitoring',
  system_code = 'IMPL_MONITORING',
  updated_by = '관리자',
  updated_at = CURRENT_TIMESTAMP
WHERE menu_code = '0401';

-- 0402. 점검자지정 (URL 통일)
UPDATE rsms.menu_items
SET
  url = '/app/compliance/inspector-assign',
  system_code = 'INSPECTOR_ASSIGN',
  updated_by = '관리자',
  updated_at = CURRENT_TIMESTAMP
WHERE menu_code = '0402';

-- 0403. 점검수행 및 결재 → 이행점검현황
UPDATE rsms.menu_items
SET
  menu_name = '이행점검현황',
  description = '이행점검 현황 관리',
  url = '/app/compliance/impl-monitoring-status',
  system_code = 'IMPL_MONITORING_STATUS',
  updated_by = '관리자',
  updated_at = CURRENT_TIMESTAMP
WHERE menu_code = '0403';

-- =====================================================
-- 결과 확인 쿼리
-- =====================================================
-- SELECT
--   menu_code,
--   menu_name,
--   description,
--   url,
--   system_code,
--   updated_at
-- FROM rsms.menu_items
-- WHERE menu_code IN ('0401', '0402', '0403')
-- ORDER BY menu_code;

-- 스크립트 완료
