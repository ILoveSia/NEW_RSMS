-- =====================================================
-- 공통코드 그룹 초기 데이터 등록
-- =====================================================
-- 작성자: Claude AI
-- 작성일: 2025-01-05
-- 설명: 애플리케이션에서 사용하는 공통코드 그룹 및 상세코드 등록
-- =====================================================

-- 1. 공통코드 그룹 등록
-- =====================================================

-- 본부코드 그룹
INSERT INTO rsms.common_codes (group_code, group_name, description, is_active, created_by, updated_by)
VALUES ('DPRM_CD', '본부코드', '본부 구분 코드 (조직 구조)', 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code) DO NOTHING;

-- 책무카테고리 그룹
INSERT INTO rsms.common_codes (group_code, group_name, description, is_active, created_by, updated_by)
VALUES ('RSBT_OBLG_CLCD', '책무카테고리', '책무 분류 카테고리 (M: 관리, I: 내부통제, C: 준법감시 등)', 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code) DO NOTHING;

-- 직책코드 그룹
INSERT INTO rsms.common_codes (group_code, group_name, description, is_active, created_by, updated_by)
VALUES ('POSITION_CD', '직책코드', '직책 구분 코드', 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code) DO NOTHING;


-- 2. 공통코드 상세 등록 - 본부코드 (DPRM_CD)
-- =====================================================

-- 리스크관리본부
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('DPRM_CD', 'HQ001', '리스크관리본부', '리스크관리 총괄 본부', 1, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 내부통제본부
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('DPRM_CD', 'HQ002', '내부통제본부', '내부통제 총괄 본부', 2, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 준법감시본부
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('DPRM_CD', 'HQ003', '준법감시본부', '준법감시 총괄 본부', 3, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- IT본부
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('DPRM_CD', 'HQ004', 'IT본부', 'IT 시스템 관리 본부', 4, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;


-- 3. 공통코드 상세 등록 - 책무카테고리 (RSBT_OBLG_CLCD)
-- =====================================================

-- 리스크관리
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('RSBT_OBLG_CLCD', 'M', '관리', '리스크 관리 책무', 1, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 내부통제
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('RSBT_OBLG_CLCD', 'I', '내부통제', '내부통제 책무', 2, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 준법감시
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('RSBT_OBLG_CLCD', 'C', '준법감시', '준법감시 책무', 3, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;


-- 4. 공통코드 상세 등록 - 직책코드 (POSITION_CD)
-- =====================================================

-- 본부장
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('POSITION_CD', 'POS001', '본부장', '본부장 직책', 1, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 부서장
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('POSITION_CD', 'POS002', '부서장', '부서장 직책', 2, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 팀장
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('POSITION_CD', 'POS003', '팀장', '팀장 직책', 3, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 파트장
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('POSITION_CD', 'POS004', '파트장', '파트장 직책', 4, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;

-- 담당자
INSERT INTO rsms.common_code_details (group_code, detail_code, detail_name, description, sort_order, is_active, created_by, updated_by)
VALUES ('POSITION_CD', 'POS005', '담당자', '업무 담당자', 5, 'Y', 'SYSTEM', 'SYSTEM')
ON CONFLICT (group_code, detail_code) DO NOTHING;


-- =====================================================
-- 등록 결과 확인
-- =====================================================

-- 공통코드 그룹 확인
SELECT group_code, group_name, description, is_active
FROM rsms.common_codes
ORDER BY group_code;

-- 공통코드 상세 확인 (본부코드)
SELECT group_code, detail_code, detail_name, description, sort_order, is_active
FROM rsms.common_code_details
WHERE group_code = 'DPRM_CD'
ORDER BY sort_order;

-- 공통코드 상세 확인 (책무카테고리)
SELECT group_code, detail_code, detail_name, description, sort_order, is_active
FROM rsms.common_code_details
WHERE group_code = 'RSBT_OBLG_CLCD'
ORDER BY sort_order;

-- 공통코드 상세 확인 (직책코드)
SELECT group_code, detail_code, detail_name, description, sort_order, is_active
FROM rsms.common_code_details
WHERE group_code = 'POSITION_CD'
ORDER BY sort_order;
