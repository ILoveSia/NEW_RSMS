
-- =====================================================
-- 초기 직원 데이터 생성
-- =====================================================
-- 설명: 시스템 운영에 필요한 기본 직원 데이터 생성
-- 작성자: Claude AI
-- 작성일: 2025-10-30
-- 참고:
--   - ADMIN001: 시스템 관리자 직원
--   - users 테이블의 FK 제약조건 충족을 위해 필수
-- =====================================================

-- =====================================================
-- 1. 시스템 관리자 직원 생성
-- =====================================================

INSERT INTO rsms.employees (
  emp_no,
  org_code,
  position_code,
  emp_name,
  emp_name_en,
  birth_date,
  gender,
  mobile_no,
  email,
  office_tel,
  join_date,
  employment_status,
  employment_type,
  job_grade,
  job_level,
  work_type,
  is_active,
  created_by,
  updated_by
) VALUES (
  'ADMIN001',           -- 직원번호
  'HEAD1010',           -- 조직코드: 경영본부 (가정, 실제 org_code로 변경 필요)
  NULL,                 -- 직책코드: 직책 없음
  '시스템관리자',        -- 사원명
  'System Admin',       -- 영문명
  '1980-01-01',         -- 생년월일
  'M',                  -- 성별: 남성
  '010-0000-0000',      -- 휴대전화번호
  'admin@rsms.com',     -- 이메일
  '02-0000-0000',       -- 사무실 전화번호
  '2020-01-01',         -- 입사일자
  'ACTIVE',             -- 재직상태: 재직
  'REGULAR',            -- 고용형태: 정규직
  '시스템관리자',        -- 직급
  10,                   -- 직급레벨: 최고
  'OFFICE',             -- 근무형태: 사무실
  'Y',                  -- 활성화
  'SYSTEM',             -- 생성자
  'SYSTEM'              -- 수정자
);

-- =====================================================
-- 2. 샘플 직원 데이터 (선택사항)
-- =====================================================

INSERT INTO rsms.employees (
  emp_no,
  org_code,
  emp_name,
  emp_name_en,
  birth_date,
  gender,
  mobile_no,
  email,
  join_date,
  employment_status,
  employment_type,
  job_grade,
  job_level,
  work_type,
  is_active,
  created_by,
  updated_by
) VALUES
-- 샘플 직원 1
(
  'EMP001',
  'HEAD1010',
  '홍길동',
  'Hong Gildong',
  '1985-03-15',
  'M',
  '010-1111-1111',
  'hong@rsms.com',
  '2015-03-01',
  'ACTIVE',
  'REGULAR',
  '부장',
  8,
  'OFFICE',
  'Y',
  'SYSTEM',
  'SYSTEM'
),
-- 샘플 직원 2
(
  'EMP002',
  'HEAD1010',
  '김영희',
  'Kim Younghee',
  '1990-06-20',
  'F',
  '010-2222-2222',
  'kim@rsms.com',
  '2018-06-01',
  'ACTIVE',
  'REGULAR',
  '차장',
  7,
  'OFFICE',
  'Y',
  'SYSTEM',
  'SYSTEM'
),
-- 샘플 직원 3
(
  'EMP003',
  'HEAD1010',
  '이철수',
  'Lee Chulsoo',
  '1992-11-10',
  'M',
  '010-3333-3333',
  'lee@rsms.com',
  '2020-01-15',
  'ACTIVE',
  'REGULAR',
  '과장',
  6,
  'OFFICE',
  'Y',
  'SYSTEM',
  'SYSTEM'
);

-- =====================================================
-- 3. 결과 확인
-- =====================================================

-- 직원 목록 확인
SELECT
  emp_no,
  emp_name,
  org_code,
  job_grade,
  employment_status,
  join_date,
  is_active
FROM rsms.employees
ORDER BY emp_no;

-- 직원 수 확인
SELECT COUNT(*) AS total_employees FROM rsms.employees;

-- =====================================================
-- 4. users 테이블 FK 제약조건 추가
-- =====================================================
-- 이제 employees 테이블에 ADMIN001이 존재하므로 FK 추가 가능

ALTER TABLE rsms.users
  ADD CONSTRAINT fk_users_emp_no FOREIGN KEY (emp_no)
    REFERENCES rsms.employees(emp_no)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- FK 제약조건 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users'
  AND tc.table_schema = 'rsms'
  AND kcu.column_name = 'emp_no';

-- 스크립트 완료

-- =====================================================
-- 운영 가이드
-- =====================================================
-- 1. 실행 순서
--    ① 24.create_table_employees.sql 실행 (employees 테이블 생성)
--    ② 128.insert_initial_employees.sql 실행 (이 파일 - 초기 직원 데이터)
--    ③ FK 제약조건 자동 추가됨
--
-- 2. org_code 값 확인 및 변경
--    - HEAD1010은 가정값입니다
--    - organizations 테이블에 실제 존재하는 org_code로 변경 필요
--    - SELECT org_code, org_name FROM rsms.organizations;
--
-- 3. 추가 직원 등록 방법
--    - 사용자관리 화면에서 등록
--    - 또는 이 스크립트에 VALUES 추가
--
-- 4. 주의사항
--    - users 테이블에 emp_no가 있는 경우 반드시 employees에 해당 데이터 필요
--    - FK 제약조건으로 인해 employees 삭제 시 users 영향 확인 필요
-- =====================================================
