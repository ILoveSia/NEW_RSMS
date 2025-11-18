-- =====================================================
-- Flyway Migration: is_active 컬럼 타입 변경
-- =====================================================
-- Version: V009
-- Description: Change is_active column type from CHAR(1) to VARCHAR(1)
-- Author: Claude AI
-- Date: 2025-01-18
-- Reason: Hibernate expects VARCHAR(1) for consistency with other tables
-- =====================================================

-- is_active 컬럼 타입 변경: CHAR(1) → VARCHAR(1)
ALTER TABLE rsms.dept_manager_manuals
  ALTER COLUMN is_active TYPE VARCHAR(1);

-- 기존 제약조건 유지 확인
-- CHECK 제약조건은 그대로 유지됩니다: CHECK (is_active IN ('Y', 'N'))
