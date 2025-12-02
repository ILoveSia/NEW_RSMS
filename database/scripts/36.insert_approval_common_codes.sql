
-- =====================================================
-- 결재 관련 공통코드 삽입
-- =====================================================
-- 설명: 결재 시스템에서 사용하는 공통코드 데이터 삽입
-- 작성자: Claude AI
-- 작성일: 2025-12-02
-- 참고:
--   - APPROVAL_STATUS: 결재상태코드 (01~05)
--   - WORK_TYPE: 업무구분코드 (WRS, IMPL, IMPROVE)
--   - APPROVAL_ACTION: 결재처리코드 (DRAFT, APPROVE 등)
-- =====================================================

-- =====================================================
-- STEP 1: 결재상태코드 (APPROVAL_STATUS)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '결재상태코드', '결재 문서의 상태를 나타내는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'APPROVAL_STATUS');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '01', '기안', 1, 'Y', '결재 기안 상태', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STATUS' AND code_detail_id = '01');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '02', '진행중', 2, 'Y', '결재 진행중 상태', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STATUS' AND code_detail_id = '02');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '03', '완료', 3, 'Y', '결재 완료 상태', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STATUS' AND code_detail_id = '03');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '04', '반려', 4, 'Y', '결재 반려 상태', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STATUS' AND code_detail_id = '04');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STATUS', '05', '회수', 5, 'Y', '결재 회수 상태', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STATUS' AND code_detail_id = '05');

-- =====================================================
-- STEP 2: 업무구분코드 (WORK_TYPE)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'WORK_TYPE', '업무구분코드', '결재 업무 유형을 구분하는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'WORK_TYPE');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'WORK_TYPE', 'WRS', '책무구조', 1, 'Y', '책무구조 관련 업무', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'WORK_TYPE' AND code_detail_id = 'WRS');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'WORK_TYPE', 'IMPL', '이행점검', 2, 'Y', '이행점검 관련 업무', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'WORK_TYPE' AND code_detail_id = 'IMPL');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'WORK_TYPE', 'IMPROVE', '개선이행', 3, 'Y', '개선이행 관련 업무', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'WORK_TYPE' AND code_detail_id = 'IMPROVE');

-- =====================================================
-- STEP 3: 결재유형코드 (APPROVAL_TYPE)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'APPROVAL_TYPE', '결재유형코드', '결재 문서의 유형을 나타내는 코드 (계획승인, 완료승인 등)', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'APPROVAL_TYPE');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_TYPE', 'PLAN_APPROVAL', '계획승인', 1, 'Y', '계획에 대한 승인 결재', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_TYPE' AND code_detail_id = 'PLAN_APPROVAL');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_TYPE', 'COMPLETE_APPROVAL', '완료승인', 2, 'Y', '완료에 대한 승인 결재', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_TYPE' AND code_detail_id = 'COMPLETE_APPROVAL');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_TYPE', 'RESULT_APPROVAL', '결과승인', 3, 'Y', '결과에 대한 승인 결재', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_TYPE' AND code_detail_id = 'RESULT_APPROVAL');

-- =====================================================
-- STEP 4: 결재처리코드 (APPROVAL_ACTION)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'APPROVAL_ACTION', '결재처리코드', '결재 처리 행위를 나타내는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'APPROVAL_ACTION');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_ACTION', 'DRAFT', '기안', 1, 'Y', '결재 기안 처리', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_ACTION' AND code_detail_id = 'DRAFT');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_ACTION', 'APPROVE', '승인', 2, 'Y', '결재 승인 처리', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_ACTION' AND code_detail_id = 'APPROVE');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_ACTION', 'REJECT', '반려', 3, 'Y', '결재 반려 처리', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_ACTION' AND code_detail_id = 'REJECT');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_ACTION', 'WITHDRAW', '회수', 4, 'Y', '결재 회수 처리', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_ACTION' AND code_detail_id = 'WITHDRAW');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_ACTION', 'FORWARD', '전달', 5, 'Y', '결재 전달 처리', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_ACTION' AND code_detail_id = 'FORWARD');

-- =====================================================
-- STEP 5: 결재단계유형코드 (APPROVAL_STEP_TYPE)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'APPROVAL_STEP_TYPE', '결재단계유형코드', '결재선 단계의 유형을 나타내는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'APPROVAL_STEP_TYPE');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STEP_TYPE', 'DRAFT', '기안', 1, 'Y', '기안 단계', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STEP_TYPE' AND code_detail_id = 'DRAFT');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STEP_TYPE', 'REVIEW', '검토', 2, 'Y', '검토 단계', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STEP_TYPE' AND code_detail_id = 'REVIEW');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STEP_TYPE', 'APPROVE', '승인', 3, 'Y', '승인 단계', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STEP_TYPE' AND code_detail_id = 'APPROVE');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVAL_STEP_TYPE', 'FINAL', '최종승인', 4, 'Y', '최종승인 단계', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVAL_STEP_TYPE' AND code_detail_id = 'FINAL');

-- =====================================================
-- STEP 6: 결재자유형코드 (APPROVER_TYPE)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'APPROVER_TYPE', '결재자유형코드', '결재자의 유형을 나타내는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'APPROVER_TYPE');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVER_TYPE', 'USER', '개인', 1, 'Y', '특정 사용자 지정', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVER_TYPE' AND code_detail_id = 'USER');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVER_TYPE', 'POSITION', '직책', 2, 'Y', '특정 직책 지정', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVER_TYPE' AND code_detail_id = 'POSITION');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'APPROVER_TYPE', 'DEPT', '부서장', 3, 'Y', '부서장 자동 지정', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'APPROVER_TYPE' AND code_detail_id = 'DEPT');

-- =====================================================
-- STEP 7: 우선순위코드 (PRIORITY)
-- =====================================================

-- 공통코드 그룹 등록 (없으면 추가)
INSERT INTO rsms.common_codes (code_id, code_name, description, is_active, created_by, updated_by)
SELECT 'PRIORITY', '우선순위코드', '업무 우선순위를 나타내는 코드', 'Y', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_codes WHERE code_id = 'PRIORITY');

-- 상세코드 등록
INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'PRIORITY', 'HIGH', '높음', 1, 'Y', '우선순위 높음', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'PRIORITY' AND code_detail_id = 'HIGH');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'PRIORITY', 'MEDIUM', '보통', 2, 'Y', '우선순위 보통', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'PRIORITY' AND code_detail_id = 'MEDIUM');

INSERT INTO rsms.common_code_details (code_id, code_detail_id, code_name, sort_order, is_active, description, created_by, updated_by)
SELECT 'PRIORITY', 'LOW', '낮음', 3, 'Y', '우선순위 낮음', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rsms.common_code_details WHERE code_id = 'PRIORITY' AND code_detail_id = 'LOW');

-- =====================================================
-- 스크립트 완료
-- =====================================================
