
-- =====================================================
-- 접근 로그 테이블 (access_logs)
-- =====================================================
-- 설명: 사용자의 메뉴/API 접근 이력을 추적하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-10-28
-- 참고:
--   - AccessLog UI와 매핑
--   - 페이지 조회, API 호출, 파일 다운로드/업로드 등 모든 접근 기록
--   - 보안 감사 및 사용 패턴 분석에 활용
-- =====================================================

-- DROP TABLE IF EXISTS rsms.access_logs CASCADE;

CREATE TABLE rsms.access_logs (
  -- 기본키
  access_log_id BIGSERIAL PRIMARY KEY,             -- 접근로그ID (PK, 자동증가)

  -- 사용자 정보
  user_id BIGINT,                                  -- 사용자 ID (users FK)
  username VARCHAR(50),                            -- 사용자명
  session_id VARCHAR(255),                         -- 세션 ID

  -- 접근 정보
  access_type VARCHAR(20) NOT NULL,                -- 접근 유형 (PAGE_VIEW, API_CALL, DOWNLOAD, UPLOAD)
  access_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 접근 시각

  -- 메뉴 정보
  menu_id BIGINT,                                  -- 메뉴 ID (menu_items FK)
  menu_name VARCHAR(100),                          -- 메뉴명
  menu_url VARCHAR(500),                           -- 메뉴 URL

  -- API 정보
  http_method VARCHAR(10),                         -- HTTP 메서드 (GET, POST, PUT, DELETE 등)
  request_uri VARCHAR(500),                        -- 요청 URI
  query_string TEXT,                               -- 쿼리 스트링
  request_body TEXT,                               -- 요청 본문 (민감 정보 제외)

  -- 응답 정보
  response_status INT,                             -- HTTP 응답 코드 (200, 404, 500 등)
  response_time_ms INT,                            -- 응답 시간 (밀리초)
  error_message TEXT,                              -- 에러 메시지 (오류 발생 시)

  -- 파일 정보 (업로드/다운로드 시)
  file_name VARCHAR(255),                          -- 파일명
  file_size BIGINT,                                -- 파일 크기 (바이트)
  file_type VARCHAR(100),                          -- 파일 유형 (MIME type)

  -- 네트워크 정보
  ip_address VARCHAR(45) NOT NULL,                 -- IP 주소 (IPv6 지원)
  user_agent TEXT,                                 -- User-Agent 정보
  referer VARCHAR(500),                            -- Referer 정보

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
  CONSTRAINT fk_access_logs_user
    FOREIGN KEY (user_id)
    REFERENCES rsms.users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_access_logs_menu
    FOREIGN KEY (menu_id)
    REFERENCES rsms.menu_items(menu_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- 체크 제약조건
  CONSTRAINT chk_access_logs_type CHECK (access_type IN ('PAGE_VIEW', 'API_CALL', 'DOWNLOAD', 'UPLOAD')),
  CONSTRAINT chk_access_logs_http_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
  CONSTRAINT chk_access_logs_is_deleted CHECK (is_deleted IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_access_logs_user_id ON rsms.access_logs(user_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_username ON rsms.access_logs(username) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_session_id ON rsms.access_logs(session_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_access_at ON rsms.access_logs(access_at DESC) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_menu_id ON rsms.access_logs(menu_id) WHERE is_deleted = 'N';
CREATE INDEX idx_access_logs_ip_address ON rsms.access_logs(ip_address) WHERE is_deleted = 'N';

-- 복합 인덱스 (사용자별 최근 접근 조회 최적화)
CREATE INDEX idx_access_logs_user_recent ON rsms.access_logs(user_id, access_at DESC)
  WHERE is_deleted = 'N';

-- 메뉴별 접근 통계 최적화
CREATE INDEX idx_access_logs_menu_stats ON rsms.access_logs(menu_id, access_at DESC)
  WHERE is_deleted = 'N' AND access_type = 'PAGE_VIEW';

-- API 성능 분석 최적화
CREATE INDEX idx_access_logs_api_performance ON rsms.access_logs(request_uri, response_time_ms)
  WHERE is_deleted = 'N' AND access_type = 'API_CALL';

-- 에러 로그 조회 최적화
CREATE INDEX idx_access_logs_errors ON rsms.access_logs(access_at DESC)
  WHERE is_deleted = 'N' AND response_status >= 400;

-- 코멘트 추가
COMMENT ON TABLE rsms.access_logs IS '접근 로그 (메뉴/API 접근 이력)';
COMMENT ON COLUMN rsms.access_logs.access_log_id IS '접근로그ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.access_logs.user_id IS '사용자 ID (users FK)';
COMMENT ON COLUMN rsms.access_logs.username IS '사용자명';
COMMENT ON COLUMN rsms.access_logs.session_id IS '세션 ID';
COMMENT ON COLUMN rsms.access_logs.access_type IS 'PAGE_VIEW: 페이지 조회, API_CALL: API 호출, DOWNLOAD: 다운로드, UPLOAD: 업로드';
COMMENT ON COLUMN rsms.access_logs.access_at IS '접근 시각';
COMMENT ON COLUMN rsms.access_logs.menu_id IS '메뉴 ID (menu_items FK)';
COMMENT ON COLUMN rsms.access_logs.menu_name IS '메뉴명';
COMMENT ON COLUMN rsms.access_logs.menu_url IS '메뉴 URL';
COMMENT ON COLUMN rsms.access_logs.http_method IS 'HTTP 메서드 (GET, POST, PUT, DELETE 등)';
COMMENT ON COLUMN rsms.access_logs.request_uri IS '요청 URI';
COMMENT ON COLUMN rsms.access_logs.response_status IS 'HTTP 응답 코드 (200, 404, 500 등)';
COMMENT ON COLUMN rsms.access_logs.response_time_ms IS '응답 시간 (밀리초)';
COMMENT ON COLUMN rsms.access_logs.ip_address IS 'IP 주소 (IPv6 지원)';

-- updated_at 자동 갱신 트리거 생성
CREATE TRIGGER trigger_access_logs_updated_at
  BEFORE UPDATE ON rsms.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 스크립트 완료
