
-- =====================================================
-- Spring Session JDBC 테이블 (spring_session, spring_session_attributes)
-- =====================================================
-- 설명: Spring Session JDBC를 위한 세션 저장 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - Spring Session JDBC의 표준 스키마
--   - PostgreSQL 최적화 적용
--   - 세션 타임아웃: 30분 (application.yml에서 설정)
--   - 자동 정리: 15분마다 만료된 세션 삭제 (Cron 작업)
-- =====================================================

-- DROP TABLE IF EXISTS rsms.spring_session_attributes CASCADE;
-- DROP TABLE IF EXISTS rsms.spring_session CASCADE;

-- =====================================================
-- 1. spring_session 테이블
-- =====================================================
-- 설명: 세션 메타데이터 저장
CREATE TABLE rsms.spring_session (
  -- 기본키
  primary_id CHAR(36) NOT NULL,                    -- 세션 기본 ID (UUID)
  session_id CHAR(36) NOT NULL,                    -- 세션 ID (UUID)

  -- 세션 정보
  creation_time BIGINT NOT NULL,                   -- 생성 시간 (Epoch 밀리초)
  last_access_time BIGINT NOT NULL,                -- 마지막 접근 시간 (Epoch 밀리초)
  max_inactive_interval INT NOT NULL,              -- 최대 비활성 시간 (초, 기본값: 1800 = 30분)
  expiry_time BIGINT NOT NULL,                     -- 만료 시간 (Epoch 밀리초)

  -- 사용자 정보 (Spring Security Principal)
  principal_name VARCHAR(100),                     -- 인증된 사용자명

  -- 제약조건
  CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

-- 인덱스 생성
CREATE UNIQUE INDEX spring_session_ix1 ON rsms.spring_session (session_id);
CREATE INDEX spring_session_ix2 ON rsms.spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON rsms.spring_session (principal_name);

-- 코멘트 추가
COMMENT ON TABLE rsms.spring_session IS 'Spring Session JDBC - 세션 메타데이터';
COMMENT ON COLUMN rsms.spring_session.primary_id IS '세션 기본 ID (UUID, PK)';
COMMENT ON COLUMN rsms.spring_session.session_id IS '세션 ID (UUID, 고유)';
COMMENT ON COLUMN rsms.spring_session.creation_time IS '생성 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.last_access_time IS '마지막 접근 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.max_inactive_interval IS '최대 비활성 시간 (초, 기본값: 1800 = 30분)';
COMMENT ON COLUMN rsms.spring_session.expiry_time IS '만료 시간 (Epoch 밀리초)';
COMMENT ON COLUMN rsms.spring_session.principal_name IS '인증된 사용자명 (Spring Security Principal)';

-- =====================================================
-- 2. spring_session_attributes 테이블
-- =====================================================
-- 설명: 세션 속성(Attribute) 저장
CREATE TABLE rsms.spring_session_attributes (
  -- 기본키 (복합키)
  session_primary_id CHAR(36) NOT NULL,            -- 세션 기본 ID (spring_session FK)
  attribute_name VARCHAR(200) NOT NULL,            -- 속성 이름

  -- 속성 값
  attribute_bytes BYTEA NOT NULL,                  -- 속성 값 (직렬화된 바이트)

  -- 제약조건
  CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),

  -- 외래키 제약조건
  CONSTRAINT spring_session_attributes_fk
    FOREIGN KEY (session_primary_id)
    REFERENCES rsms.spring_session(primary_id)
    ON DELETE CASCADE
);

-- 코멘트 추가
COMMENT ON TABLE rsms.spring_session_attributes IS 'Spring Session JDBC - 세션 속성 저장';
COMMENT ON COLUMN rsms.spring_session_attributes.session_primary_id IS '세션 기본 ID (spring_session FK)';
COMMENT ON COLUMN rsms.spring_session_attributes.attribute_name IS '속성 이름';
COMMENT ON COLUMN rsms.spring_session_attributes.attribute_bytes IS '속성 값 (직렬화된 바이트)';

-- =====================================================
-- 추가 최적화 및 유지보수
-- =====================================================

-- 1. 만료된 세션 정리 함수
CREATE OR REPLACE FUNCTION rsms.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM rsms.spring_session WHERE expiry_time < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rsms.cleanup_expired_sessions() IS '만료된 세션 정리 (Cron 작업에서 호출)';

-- 2. 세션 통계 뷰 (선택)
CREATE OR REPLACE VIEW rsms.v_session_statistics AS
SELECT
  COUNT(*) AS total_sessions,
  COUNT(DISTINCT principal_name) AS unique_users,
  AVG(EXTRACT(EPOCH FROM NOW()) * 1000 - last_access_time) / 1000 AS avg_idle_seconds,
  MIN(creation_time) AS oldest_session_time,
  MAX(creation_time) AS newest_session_time
FROM rsms.spring_session
WHERE expiry_time > EXTRACT(EPOCH FROM NOW()) * 1000;

COMMENT ON VIEW rsms.v_session_statistics IS '세션 통계 뷰 (활성 세션 정보)';

-- 3. 사용자별 활성 세션 뷰
CREATE OR REPLACE VIEW rsms.v_active_user_sessions AS
SELECT
  principal_name,
  COUNT(*) AS active_session_count,
  MAX(last_access_time) AS last_activity_time
FROM rsms.spring_session
WHERE expiry_time > EXTRACT(EPOCH FROM NOW()) * 1000
  AND principal_name IS NOT NULL
GROUP BY principal_name;

COMMENT ON VIEW rsms.v_active_user_sessions IS '사용자별 활성 세션 뷰';

-- 스크립트 완료

-- =====================================================
-- 운영 가이드
-- =====================================================
-- 1. Cron 작업 설정 (15분마다 만료 세션 정리)
--    - Linux Cron: */15 * * * * psql -U rsms_user -d rsms_db -c "SELECT rsms.cleanup_expired_sessions();"
--    - Spring Scheduler: @Scheduled(cron = "0 */15 * * * *")
--
-- 2. 세션 모니터링
--    - SELECT * FROM rsms.v_session_statistics;
--    - SELECT * FROM rsms.v_active_user_sessions;
--
-- 3. 특정 사용자 세션 강제 종료
--    - DELETE FROM rsms.spring_session WHERE principal_name = 'username';
--
-- 4. 모든 세션 초기화 (긴급 상황)
--    - DELETE FROM rsms.spring_session;
--
-- 5. Spring Boot application.yml 설정
--    spring:
--      session:
--        store-type: jdbc
--        jdbc:
--          initialize-schema: never  # DDL 스크립트로 이미 생성했으므로
--          table-name: RSMS.SPRING_SESSION  # 스키마 지정
-- =====================================================
