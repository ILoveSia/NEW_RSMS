
-- =====================================================
-- public 스키마의 spring_session 테이블 정리
-- =====================================================
-- 설명: rsms 스키마로 통일하기 위해 public 스키마의 spring_session 테이블 삭제
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - rsms.spring_session, rsms.spring_session_attributes 사용으로 변경
--   - public 스키마의 테이블은 더 이상 사용하지 않음
-- =====================================================

-- =====================================================
-- 1. 기존 데이터 확인 (삭제 전 백업 필요 시)
-- =====================================================
-- SELECT COUNT(*) FROM public.spring_session;
-- SELECT COUNT(*) FROM public.spring_session_attributes;

-- =====================================================
-- 2. public 스키마 테이블 삭제
-- =====================================================

-- spring_session_attributes 먼저 삭제 (외래키 때문에)
DROP TABLE IF EXISTS public.spring_session_attributes CASCADE;

-- spring_session 테이블 삭제
DROP TABLE IF EXISTS public.spring_session CASCADE;

-- =====================================================
-- 3. 삭제 확인
-- =====================================================
-- SELECT table_schema, table_name
-- FROM information_schema.tables
-- WHERE table_name LIKE 'spring_session%'
-- ORDER BY table_schema, table_name;

-- 결과: rsms.spring_session, rsms.spring_session_attributes만 존재해야 함

-- 스크립트 완료

-- =====================================================
-- 운영 가이드
-- =====================================================
-- 1. 실행 순서
--    a) 기존 세션 데이터가 중요한 경우:
--       - SELECT * FROM public.spring_session; 로 백업 먼저
--    b) 이 스크립트 실행
--    c) rsms.spring_session 테이블 사용 확인
--
-- 2. 롤백이 필요한 경우
--    - 23.create_spring_session_tables.sql 에서 public 스키마로 재생성
--    - 하지만 권장하지 않음 (rsms 스키마 사용 권장)
-- =====================================================
