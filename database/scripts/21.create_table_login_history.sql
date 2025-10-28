
-- =====================================================
-- 로그인 이력 테이블 (login_history)
-- =====================================================
-- 설명: 사용자의 모든 로그인 시도 이력을 추적하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - 성공/실패한 모든 로그인 시도를 기록
--   - 보안 감사 및 계정 잠금 정책에 활용
--   - 세션 ID와 연계하여 세션 추적 가능
-- =====================================================

-- DROP TABLE IF EXISTS rsms.login_history CASCADE;

CREATE TABLE rsms.login_history (
  -- 기본키
  login_history_id BIGSERIAL PRIMARY KEY,          -- 로그인이력ID (PK, 자동증가)

  -- 사용자 정보
  user_id BIGINT,                                  -- 사용자 ID (users FK, NULL 가능 - 실패 시)
  username VARCHAR(50) NOT NULL,                   -- 로그인 시도한 사용자명

  -- 로그인 시도 정보
  login_status VARCHAR(20) NOT NULL,               -- 로그인 상태 (SUCCESS, FAILED, LOCKED, BLOCKED)
  login_type VARCHAR(20) NOT NULL DEFAULT 'WEB',   -- 로그인 유형 (WEB, MOBILE, API)
  login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 로그인 시도 시각
  logout_at TIMESTAMP,                             -- 로그아웃 시각 (NULL: 현재 로그인 중)

  -- 실패 정보
  failure_reason VARCHAR(200),                     -- 실패 사유 (잘못된 비밀번호, 계정 잠금 등)
  failure_count INT DEFAULT 0,                     -- 연속 실패 횟수

  -- 세션 및 네트워크 정보
  session_id VARCHAR(255),                         -- Spring Session ID
  ip_address VARCHAR(45) NOT NULL,                 -- IP 주소 (IPv6 지원)
  user_agent TEXT,                                 -- User-Agent 정보

  -- 위치 정보 (선택)
  country_code VARCHAR(2),                         -- 국가 코드 (ISO 3166-1 alpha-2)
  city VARCHAR(100),                               -- 도시명

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                -- 생성자 (시스템)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  is_deleted VARCHAR(1) NOT NULL DEFAULT 'N',      -- 삭제여부 ('Y', 'N')

  -- 외래키 제약조건
  CONSTRAINT fk_login_history_user
    FOREIGN KEY (user_id)
    REFERENCES rsms.users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_login_history_status CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED', 'BLOCKED')),
  CONSTRAINT chk_login_history_type CHECK (login_type IN ('WEB', 'MOBILE', 'API')),
  CONSTRAINT chk_login_history_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_login_history_user_id ON rsms.login_history(user_id) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_username ON rsms.login_history(username) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_login_at ON rsms.login_history(login_at DESC) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_session_id ON rsms.login_history(session_id) WHERE is_deleted = 'N';
CREATE INDEX idx_login_history_ip_address ON rsms.login_history(ip_address) WHERE is_deleted = 'N';

-- 복합 인덱스 (사용자별 최근 로그인 조회 최적화)
CREATE INDEX idx_login_history_user_recent ON rsms.login_history(user_id, login_at DESC)
  WHERE is_deleted = 'N' AND login_status = 'SUCCESS';

-- 실패 이력 조회 최적화
CREATE INDEX idx_login_history_failures ON rsms.login_history(username, login_at DESC)
  WHERE is_deleted = 'N' AND login_status = 'FAILED';

-- 코멘트 추가
COMMENT ON TABLE rsms.login_history IS '로그인 이력 (모든 로그인 시도 추적)';
COMMENT ON COLUMN rsms.login_history.login_history_id IS '로그인이력ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.login_history.user_id IS '사용자 ID (users FK, 실패 시 NULL 가능)';
COMMENT ON COLUMN rsms.login_history.username IS '로그인 시도한 사용자명';
COMMENT ON COLUMN rsms.login_history.login_status IS 'SUCCESS: 성공, FAILED: 실패, LOCKED: 계정 잠금, BLOCKED: 차단';
COMMENT ON COLUMN rsms.login_history.login_type IS 'WEB: 웹, MOBILE: 모바일, API: API';
COMMENT ON COLUMN rsms.login_history.login_at IS '로그인 시도 시각';
COMMENT ON COLUMN rsms.login_history.logout_at IS '로그아웃 시각 (NULL: 현재 로그인 중)';
COMMENT ON COLUMN rsms.login_history.failure_reason IS '실패 사유 (잘못된 비밀번호, 계정 잠금 등)';
COMMENT ON COLUMN rsms.login_history.failure_count IS '연속 실패 횟수';
COMMENT ON COLUMN rsms.login_history.session_id IS 'Spring Session ID';
COMMENT ON COLUMN rsms.login_history.ip_address IS 'IP 주소 (IPv6 지원)';
COMMENT ON COLUMN rsms.login_history.user_agent IS 'User-Agent 정보';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_login_history_updated_at
  BEFORE UPDATE ON rsms.login_history
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료
