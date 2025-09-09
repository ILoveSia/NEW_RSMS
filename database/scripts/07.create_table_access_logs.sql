-- DROP TABLE rsms.access_logs CASCADE;

CREATE TABLE rsms.access_logs (
  id SERIAL PRIMARY KEY,
  log_id VARCHAR(100) NOT NULL UNIQUE,
  user_id VARCHAR(100) NULL,                           -- 사용자 ID (비로그인 액세스 시 NULL 가능)
  session_id VARCHAR(100) NULL,                        -- 세션 ID
  action VARCHAR(100) NOT NULL,                        -- 액션명 (LOGIN, LOGOUT, CREATE_RISK 등)
  resource VARCHAR(200) NOT NULL,                      -- 접근 리소스 (/api/users, /api/risks 등)
  method VARCHAR(10) NOT NULL,                         -- HTTP 메소드 (GET, POST, PUT, DELETE)
  ip_address VARCHAR(45) NOT NULL,                     -- IP 주소 (IPv6 지원)
  user_agent TEXT NULL,                                -- 사용자 에이전트
  status_code INT NOT NULL,                            -- HTTP 응답 코드
  response_time INT DEFAULT 0,                         -- 응답 시간 (milliseconds)
  request_body TEXT NULL,                              -- 요청 본문 (민감 정보 제외)
  response_message VARCHAR(500) NULL,                  -- 응답 메시지
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_id VARCHAR(100) DEFAULT 'SYSTEM'
);

-- 인덱스 생성
CREATE INDEX idx_access_logs_user_id ON rsms.access_logs(user_id);
CREATE INDEX idx_access_logs_created_at ON rsms.access_logs(created_at);
CREATE INDEX idx_access_logs_action ON rsms.access_logs(action);
CREATE INDEX idx_access_logs_status_code ON rsms.access_logs(status_code);
CREATE INDEX idx_access_logs_ip_address ON rsms.access_logs(ip_address);

-- 파티션 테이블 생성을 위한 준비 (월별 파티셔닝 권장)
-- CREATE TABLE rsms.access_logs_y2025m01 PARTITION OF rsms.access_logs
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

COMMENT ON TABLE rsms.access_logs IS '사용자 접근 로그 테이블';
COMMENT ON COLUMN rsms.access_logs.log_id IS '로그 고유 ID';
COMMENT ON COLUMN rsms.access_logs.user_id IS '접근한 사용자 ID';
COMMENT ON COLUMN rsms.access_logs.session_id IS '세션 ID';
COMMENT ON COLUMN rsms.access_logs.action IS '수행한 액션';
COMMENT ON COLUMN rsms.access_logs.resource IS '접근한 리소스 경로';
COMMENT ON COLUMN rsms.access_logs.method IS 'HTTP 메소드';
COMMENT ON COLUMN rsms.access_logs.ip_address IS '접근 IP 주소';
COMMENT ON COLUMN rsms.access_logs.user_agent IS '사용자 에이전트 정보';
COMMENT ON COLUMN rsms.access_logs.status_code IS 'HTTP 응답 상태 코드';
COMMENT ON COLUMN rsms.access_logs.response_time IS '응답 시간 (밀리초)';
COMMENT ON COLUMN rsms.access_logs.request_body IS '요청 본문 (민감정보 제외)';
COMMENT ON COLUMN rsms.access_logs.response_message IS '응답 메시지';