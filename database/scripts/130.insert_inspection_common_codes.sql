-- =====================================================
-- 이행점검 관련 공통코드 등록
-- =====================================================
-- 설명: 이행점검 프로세스에 필요한 공통코드 등록
-- 작성자: Claude AI
-- 작성일: 2025-11-08
-- 참고:
--   - 3가지 상태코드 그룹 등록
--     1) INSPECTION_STATUS: 점검결과상태코드
--     2) IMPROVEMENT_STATUS: 개선이행상태코드
--     3) FINAL_INSPECTION_RESULT: 최종점검결과코드
-- =====================================================

-- =====================================================
-- 1. 점검결과상태코드 (INSPECTION_STATUS)
-- =====================================================

-- 공통코드 그룹 등록
INSERT INTO rsms.common_codes (
  group_cd,
  group_name,
  description,
  is_active,
  created_by,
  updated_by
) VALUES (
  'INSPECTION_STATUS',
  '점검결과상태코드',
  '이행점검 결과 상태 관리 (미점검/적정/부적정)',
  'Y',
  'system',
  'system'
);

-- 공통코드 상세 등록
INSERT INTO rsms.common_code_details (
  group_cd,
  detail_cd,
  detail_name,
  detail_value,
  description,
  sort_order,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 01: 미점검
  (
    'INSPECTION_STATUS',
    '01',
    '미점검',
    'NOT_INSPECTED',
    '점검 대기 상태 (점검자 배정 완료, 점검 미실시)',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 02: 적정
  (
    'INSPECTION_STATUS',
    '02',
    '적정',
    'PROPER',
    '점검 완료, 문제 없음 (프로세스 종료)',
    2,
    'Y',
    'system',
    'system'
  ),
  -- 03: 부적정
  (
    'INSPECTION_STATUS',
    '03',
    '부적정',
    'IMPROPER',
    '점검 완료, 개선 필요 (개선이행 단계로 진행)',
    3,
    'Y',
    'system',
    'system'
  );

-- =====================================================
-- 2. 개선이행상태코드 (IMPROVEMENT_STATUS)
-- =====================================================

-- 공통코드 그룹 등록
INSERT INTO rsms.common_codes (
  group_cd,
  group_name,
  description,
  is_active,
  created_by,
  updated_by
) VALUES (
  'IMPROVEMENT_STATUS',
  '개선이행상태코드',
  '개선이행 진행상태 관리 (미이행/진행중/완료)',
  'Y',
  'system',
  'system'
);

-- 공통코드 상세 등록
INSERT INTO rsms.common_code_details (
  group_cd,
  detail_cd,
  detail_name,
  detail_value,
  description,
  sort_order,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 01: 개선미이행
  (
    'IMPROVEMENT_STATUS',
    '01',
    '개선미이행',
    'NOT_STARTED',
    '개선 시작 전 (적정 판정 또는 부적정 판정 후 개선계획 수립 전)',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 02: 개선이행진행중
  (
    'IMPROVEMENT_STATUS',
    '02',
    '개선이행진행중',
    'IN_PROGRESS',
    '개선 작업 진행 중 (개선계획 수립 완료, 개선 작업 진행 중)',
    2,
    'Y',
    'system',
    'system'
  ),
  -- 03: 개선이행완료
  (
    'IMPROVEMENT_STATUS',
    '03',
    '개선이행완료',
    'COMPLETED',
    '개선 작업 완료 (최종점검 대기 중)',
    3,
    'Y',
    'system',
    'system'
  );

-- =====================================================
-- 3. 최종점검결과코드 (FINAL_INSPECTION_RESULT)
-- =====================================================

-- 공통코드 그룹 등록
INSERT INTO rsms.common_codes (
  group_cd,
  group_name,
  description,
  is_active,
  created_by,
  updated_by
) VALUES (
  'FINAL_INSPECTION_RESULT',
  '최종점검결과코드',
  '최종점검 승인/반려 결과 관리',
  'Y',
  'system',
  'system'
);

-- 공통코드 상세 등록
INSERT INTO rsms.common_code_details (
  group_cd,
  detail_cd,
  detail_name,
  detail_value,
  description,
  sort_order,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 01: 승인
  (
    'FINAL_INSPECTION_RESULT',
    '01',
    '승인',
    'APPROVED',
    '최종점검 승인 완료 (프로세스 최종 종료)',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 02: 반려
  (
    'FINAL_INSPECTION_RESULT',
    '02',
    '반려',
    'REJECTED',
    '최종점검 반려 (개선이행 재작업 필요)',
    2,
    'Y',
    'system',
    'system'
  );

-- =====================================================
-- 등록 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 이행점검 관련 공통코드 등록 완료';
  RAISE NOTICE '';
  RAISE NOTICE '📋 등록된 공통코드 그룹:';
  RAISE NOTICE '  1. INSPECTION_STATUS (점검결과상태코드) - 3개 코드';
  RAISE NOTICE '  2. IMPROVEMENT_STATUS (개선이행상태코드) - 3개 코드';
  RAISE NOTICE '  3. FINAL_INSPECTION_RESULT (최종점검결과코드) - 2개 코드';
  RAISE NOTICE '';
  RAISE NOTICE '📊 총 8개 상세코드 등록 완료';
END $$;
