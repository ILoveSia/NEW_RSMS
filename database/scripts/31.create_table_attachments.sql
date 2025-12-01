
-- =====================================================
-- 첨부파일 테이블 (attachments) 생성
-- =====================================================
-- 설명: 다양한 엔티티에 연결되는 첨부파일 정보를 관리하는 테이블
-- 작성자: Claude AI
-- 작성일: 2025-12-01
-- 참고:
--   - 다형성 관계: entity_type과 entity_id로 다양한 테이블과 연결
--   - 지원 엔티티: impl_inspection_items, submit_reports, board_resolutions 등
--   - 파일 저장 방식: 파일 시스템 저장 (경로 저장) + DB 메타데이터
--   - 첨부파일ID 코드 생성 규칙: ATT + YYYYMMDD + 순번(6자리)
--     예: ATT20251201000001
-- =====================================================

-- =====================================================
-- STEP 1: 첨부파일ID 자동 생성 함수
-- =====================================================

-- 일자별 순번 생성을 위한 함수
CREATE OR REPLACE FUNCTION rsms.generate_attachment_id()
RETURNS VARCHAR(20) AS $$
DECLARE
  today_str VARCHAR(8);
  next_seq VARCHAR(6);
  new_id VARCHAR(20);
  max_seq INTEGER;
BEGIN
  -- 오늘 날짜 (YYYYMMDD)
  today_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- 오늘 날짜의 최대 순번 조회
  SELECT MAX(SUBSTRING(attachment_id, 12, 6)::INTEGER) INTO max_seq
  FROM rsms.attachments
  WHERE SUBSTRING(attachment_id, 4, 8) = today_str;

  -- 순번 계산
  IF max_seq IS NULL THEN
    -- 오늘의 첫 번째 첨부파일
    next_seq := '000001';
  ELSE
    -- 기존 순번에서 1 증가
    next_seq := LPAD((max_seq + 1)::TEXT, 6, '0');
  END IF;

  -- 새 ID 생성: ATT + YYYYMMDD + 순번(6자리)
  new_id := 'ATT' || today_str || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: attachments 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.attachments CASCADE;

CREATE TABLE rsms.attachments (
  -- ============================================
  -- 기본키
  -- ============================================
  -- 코드 생성 규칙: ATT + YYYYMMDD + 순번(6자리)
  -- 예시: "ATT20251201000001"
  attachment_id VARCHAR(20) PRIMARY KEY,           -- 첨부파일ID (PK, 업무 코드)

  -- ============================================
  -- 다형성 관계 컬럼 (연결 엔티티 정보)
  -- ============================================
  entity_type VARCHAR(100) NOT NULL,               -- 연결된 엔티티 타입 (테이블명)
                                                   -- 예: 'impl_inspection_items', 'submit_reports', 'board_resolutions'
  entity_id VARCHAR(100) NOT NULL,                 -- 해당 엔티티의 기본키 ID

  -- ============================================
  -- 업무 단계 구분 컬럼
  -- ============================================
  attachment_phase VARCHAR(50),                    -- 첨부파일 업무 단계 (같은 엔티티 내 구분용)
                                                   -- 예: 'PLAN'=개선계획, 'IMPL'=개선이행, 'FINAL'=최종점검
                                                   -- NULL이면 단계 구분 없음 (일반 첨부)

  -- ============================================
  -- 파일 메타데이터
  -- ============================================
  file_name VARCHAR(500) NOT NULL,                 -- 원본 파일명 (사용자가 업로드한 파일명)
  file_path VARCHAR(1000) NOT NULL,                -- 저장 경로 (서버 파일 시스템 경로)
  stored_file_name VARCHAR(500) NOT NULL,          -- 저장 파일명 (UUID 등으로 변환된 파일명)
  file_extension VARCHAR(50),                      -- 파일 확장자 (예: pdf, xlsx, jpg)
  file_size BIGINT NOT NULL DEFAULT 0,             -- 파일 크기 (bytes)
  content_type VARCHAR(200),                       -- MIME 타입 (예: application/pdf, image/jpeg)

  -- ============================================
  -- 파일 분류 정보
  -- ============================================
  file_category VARCHAR(50),                       -- 파일 분류 (예: EVIDENCE=증빙자료, REPORT=보고서, IMAGE=이미지)
  description VARCHAR(1000),                       -- 파일 설명
  sort_order INTEGER DEFAULT 0,                    -- 정렬 순서 (같은 엔티티 내 파일 순서)

  -- ============================================
  -- 다운로드 및 접근 정보
  -- ============================================
  download_count INTEGER DEFAULT 0,                -- 다운로드 횟수
  last_download_at TIMESTAMP,                      -- 마지막 다운로드 일시
  last_download_by VARCHAR(50),                    -- 마지막 다운로드 사용자ID

  -- ============================================
  -- 공통 컬럼 (BaseEntity)
  -- ============================================
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',       -- 사용여부 ('Y', 'N')
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시 (업로드일시)
  created_by VARCHAR(50) NOT NULL,                 -- 생성자 (업로드자)
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                 -- 수정자

  -- ============================================
  -- 제약조건
  -- ============================================
  -- 첨부파일ID 형식 검증 (ATT + 8자리 날짜 + 6자리 순번)
  CONSTRAINT chk_attachment_id_format CHECK (
    attachment_id ~ '^ATT[0-9]{8}[0-9]{6}$' AND LENGTH(attachment_id) = 17
  ),

  -- 사용여부 검증
  CONSTRAINT chk_attachments_is_active CHECK (is_active IN ('Y', 'N')),

  -- 파일 크기 검증 (음수 불가)
  CONSTRAINT chk_file_size_positive CHECK (file_size >= 0),

  -- 다운로드 횟수 검증 (음수 불가)
  CONSTRAINT chk_download_count_positive CHECK (download_count >= 0),

  -- 정렬 순서 검증 (음수 불가)
  CONSTRAINT chk_sort_order_positive CHECK (sort_order >= 0)
);

-- =====================================================
-- STEP 3: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 다형성 관계 인덱스 (가장 중요 - 엔티티별 파일 조회 시 사용)
CREATE INDEX idx_attachments_entity
  ON rsms.attachments(entity_type, entity_id);

-- 다형성 관계 + 업무 단계 인덱스 (엔티티 내 단계별 파일 조회)
CREATE INDEX idx_attachments_entity_phase
  ON rsms.attachments(entity_type, entity_id, attachment_phase);

-- entity_type 단독 인덱스 (특정 타입의 모든 파일 조회 시 사용)
CREATE INDEX idx_attachments_entity_type
  ON rsms.attachments(entity_type);

-- 사용여부 인덱스
CREATE INDEX idx_attachments_is_active
  ON rsms.attachments(is_active);

-- 복합 인덱스: 엔티티 + 단계 + 사용여부 (활성화된 파일만 조회)
CREATE INDEX idx_attachments_entity_phase_active
  ON rsms.attachments(entity_type, entity_id, attachment_phase, is_active);

-- 파일 분류 인덱스
CREATE INDEX idx_attachments_category
  ON rsms.attachments(file_category);

-- 생성자 인덱스 (특정 사용자가 업로드한 파일 조회)
CREATE INDEX idx_attachments_created_by
  ON rsms.attachments(created_by);

-- 생성일시 인덱스 (기간별 파일 조회)
CREATE INDEX idx_attachments_created_at
  ON rsms.attachments(created_at);

-- 정렬 순서 인덱스 (파일 목록 정렬용)
CREATE INDEX idx_attachments_sort_order
  ON rsms.attachments(entity_type, entity_id, sort_order);

-- =====================================================
-- STEP 4: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.attachments IS '첨부파일 테이블 - 다양한 엔티티에 연결되는 첨부파일 정보 관리 (다형성 관계)';

-- 기본키 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.attachment_id IS '첨부파일ID (PK, 업무코드 - 형식: ATT + YYYYMMDD + 순번6자리, 예: ATT20251201000001)';

-- 다형성 관계 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.entity_type IS '연결된 엔티티 타입 (테이블명: impl_inspection_items, submit_reports, board_resolutions 등)';
COMMENT ON COLUMN rsms.attachments.entity_id IS '해당 엔티티의 기본키 ID (연결 대상 레코드의 PK 값)';

-- 업무 단계 구분 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.attachment_phase IS '첨부파일 업무 단계 (PLAN=개선계획, IMPL=개선이행, FINAL=최종점검, NULL=일반첨부)';

-- 파일 메타데이터 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.file_name IS '원본 파일명 (사용자가 업로드한 파일명)';
COMMENT ON COLUMN rsms.attachments.file_path IS '저장 경로 (서버 파일 시스템 내 실제 저장 경로)';
COMMENT ON COLUMN rsms.attachments.stored_file_name IS '저장 파일명 (UUID 등으로 변환된 서버 저장용 파일명)';
COMMENT ON COLUMN rsms.attachments.file_extension IS '파일 확장자 (예: pdf, xlsx, jpg, png)';
COMMENT ON COLUMN rsms.attachments.file_size IS '파일 크기 (bytes 단위)';
COMMENT ON COLUMN rsms.attachments.content_type IS 'MIME 타입 (예: application/pdf, image/jpeg, application/vnd.ms-excel)';

-- 파일 분류 정보 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.file_category IS '파일 분류 (EVIDENCE=증빙자료, REPORT=보고서, IMAGE=이미지, DOCUMENT=문서, OTHER=기타)';
COMMENT ON COLUMN rsms.attachments.description IS '파일 설명 (사용자 입력)';
COMMENT ON COLUMN rsms.attachments.sort_order IS '정렬 순서 (같은 엔티티 내 파일 정렬용)';

-- 다운로드 및 접근 정보 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.download_count IS '다운로드 횟수';
COMMENT ON COLUMN rsms.attachments.last_download_at IS '마지막 다운로드 일시';
COMMENT ON COLUMN rsms.attachments.last_download_by IS '마지막 다운로드 사용자ID';

-- 공통 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.is_active IS '사용여부 (Y: 사용, N: 삭제됨)';
COMMENT ON COLUMN rsms.attachments.created_at IS '생성일시 (업로드일시)';
COMMENT ON COLUMN rsms.attachments.created_by IS '생성자 (업로드자)';
COMMENT ON COLUMN rsms.attachments.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.attachments.updated_by IS '수정자';

-- =====================================================
-- STEP 5: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_attachments_updated_at
  BEFORE UPDATE ON rsms.attachments
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 6: 다운로드 횟수 증가 함수
-- =====================================================

-- 파일 다운로드 시 호출하는 함수
CREATE OR REPLACE FUNCTION rsms.increment_download_count(
  p_attachment_id VARCHAR(20),
  p_user_id VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
  UPDATE rsms.attachments
  SET download_count = download_count + 1,
      last_download_at = CURRENT_TIMESTAMP,
      last_download_by = p_user_id
  WHERE attachment_id = p_attachment_id
    AND is_active = 'Y';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rsms.increment_download_count(VARCHAR, VARCHAR) IS '파일 다운로드 시 호출 - 다운로드 횟수 증가 및 마지막 다운로드 정보 업데이트';

-- =====================================================
-- STEP 7: 엔티티별 첨부파일 조회 함수
-- =====================================================

-- 특정 엔티티의 활성화된 첨부파일 목록 조회 (전체 단계)
CREATE OR REPLACE FUNCTION rsms.get_attachments_by_entity(
  p_entity_type VARCHAR(100),
  p_entity_id VARCHAR(100)
)
RETURNS TABLE (
  attachment_id VARCHAR(20),
  attachment_phase VARCHAR(50),
  file_name VARCHAR(500),
  file_path VARCHAR(1000),
  stored_file_name VARCHAR(500),
  file_extension VARCHAR(50),
  file_size BIGINT,
  content_type VARCHAR(200),
  file_category VARCHAR(50),
  description VARCHAR(1000),
  sort_order INTEGER,
  download_count INTEGER,
  created_at TIMESTAMP,
  created_by VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.attachment_id,
    a.attachment_phase,
    a.file_name,
    a.file_path,
    a.stored_file_name,
    a.file_extension,
    a.file_size,
    a.content_type,
    a.file_category,
    a.description,
    a.sort_order,
    a.download_count,
    a.created_at,
    a.created_by
  FROM rsms.attachments a
  WHERE a.entity_type = p_entity_type
    AND a.entity_id = p_entity_id
    AND a.is_active = 'Y'
  ORDER BY a.attachment_phase, a.sort_order, a.created_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rsms.get_attachments_by_entity(VARCHAR, VARCHAR) IS '특정 엔티티에 연결된 활성 첨부파일 목록 조회 (전체 단계)';

-- 특정 엔티티의 특정 단계 첨부파일 목록 조회
CREATE OR REPLACE FUNCTION rsms.get_attachments_by_entity_phase(
  p_entity_type VARCHAR(100),
  p_entity_id VARCHAR(100),
  p_attachment_phase VARCHAR(50)
)
RETURNS TABLE (
  attachment_id VARCHAR(20),
  attachment_phase VARCHAR(50),
  file_name VARCHAR(500),
  file_path VARCHAR(1000),
  stored_file_name VARCHAR(500),
  file_extension VARCHAR(50),
  file_size BIGINT,
  content_type VARCHAR(200),
  file_category VARCHAR(50),
  description VARCHAR(1000),
  sort_order INTEGER,
  download_count INTEGER,
  created_at TIMESTAMP,
  created_by VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.attachment_id,
    a.attachment_phase,
    a.file_name,
    a.file_path,
    a.stored_file_name,
    a.file_extension,
    a.file_size,
    a.content_type,
    a.file_category,
    a.description,
    a.sort_order,
    a.download_count,
    a.created_at,
    a.created_by
  FROM rsms.attachments a
  WHERE a.entity_type = p_entity_type
    AND a.entity_id = p_entity_id
    AND a.attachment_phase = p_attachment_phase
    AND a.is_active = 'Y'
  ORDER BY a.sort_order, a.created_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rsms.get_attachments_by_entity_phase(VARCHAR, VARCHAR, VARCHAR) IS '특정 엔티티의 특정 단계 첨부파일 목록 조회 (예: 개선계획, 개선이행)';

-- =====================================================
-- STEP 8: 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
INSERT INTO rsms.attachments (
  attachment_id,
  entity_type,
  entity_id,
  attachment_phase,
  file_name,
  file_path,
  stored_file_name,
  file_extension,
  file_size,
  content_type,
  file_category,
  description,
  sort_order,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 샘플 1: 이행점검항목 - 개선계획 단계 첨부파일
  (
    'ATT20251201000001',
    'impl_inspection_items',
    '20250001A0001I000001',
    'PLAN',                                       -- 개선계획 단계
    '개선계획서_01.pdf',
    '/uploads/impl_inspection/2025/12/',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
    'pdf',
    1024000,
    'application/pdf',
    'EVIDENCE',
    '개선계획 증빙자료',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 샘플 2: 이행점검항목 - 개선이행 단계 첨부파일
  (
    'ATT20251201000002',
    'impl_inspection_items',
    '20250001A0001I000001',
    'IMPL',                                       -- 개선이행 단계
    '개선이행결과보고서.pdf',
    '/uploads/impl_inspection/2025/12/',
    'b2c3d4e5-f6a7-8901-bcde-f23456789012.pdf',
    'pdf',
    512000,
    'application/pdf',
    'EVIDENCE',
    '개선이행 증빙자료',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 샘플 3: 이행점검항목 - 최종점검 단계 첨부파일
  (
    'ATT20251201000003',
    'impl_inspection_items',
    '20250001A0001I000001',
    'FINAL',                                      -- 최종점검 단계
    '최종점검결과확인서.pdf',
    '/uploads/impl_inspection/2025/12/',
    'c3d4e5f6-a7b8-9012-cdef-345678901234.pdf',
    'pdf',
    256000,
    'application/pdf',
    'EVIDENCE',
    '최종점검 확인 자료',
    1,
    'Y',
    'system',
    'system'
  ),
  -- 샘플 4: 제출보고서 (단계 구분 없음 - 일반 첨부)
  (
    'ATT20251201000004',
    'submit_reports',
    'SR20251201000001',
    NULL,                                         -- 단계 구분 없음
    '월간보고서_2025년11월.xlsx',
    '/uploads/submit_reports/2025/12/',
    'd4e5f6a7-b8c9-0123-def0-456789012345.xlsx',
    'xlsx',
    2048000,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'REPORT',
    '2025년 11월 월간보고서',
    1,
    'Y',
    'system',
    'system'
  );
*/

-- =====================================================
-- STEP 9: 사용 예시 및 설명
-- =====================================================
--
-- 1) 개선계획 단계 첨부파일 업로드:
--    INSERT INTO rsms.attachments (
--      attachment_id,
--      entity_type, entity_id, attachment_phase,
--      file_name, file_path, stored_file_name,
--      file_extension, file_size, content_type,
--      file_category, description, sort_order,
--      created_by, updated_by
--    ) VALUES (
--      rsms.generate_attachment_id(),
--      'impl_inspection_items', '20250001A0001I000001', 'PLAN',
--      '개선계획서.pdf', '/uploads/2025/12/', 'uuid-generated-name.pdf',
--      'pdf', 1024000, 'application/pdf',
--      'EVIDENCE', '개선계획 증빙자료', 1,
--      'user001', 'user001'
--    );
--
-- 2) 개선이행 단계 첨부파일 업로드:
--    INSERT INTO rsms.attachments (
--      attachment_id,
--      entity_type, entity_id, attachment_phase,
--      file_name, file_path, stored_file_name,
--      file_extension, file_size, content_type,
--      file_category, description, sort_order,
--      created_by, updated_by
--    ) VALUES (
--      rsms.generate_attachment_id(),
--      'impl_inspection_items', '20250001A0001I000001', 'IMPL',
--      '개선이행결과.pdf', '/uploads/2025/12/', 'uuid-generated-name2.pdf',
--      'pdf', 2048000, 'application/pdf',
--      'EVIDENCE', '개선이행 증빙자료', 1,
--      'user001', 'user001'
--    );
--
-- 3) 특정 엔티티의 모든 첨부파일 목록 조회:
--    SELECT * FROM rsms.get_attachments_by_entity('impl_inspection_items', '20250001A0001I000001');
--
-- 4) 특정 단계의 첨부파일만 조회 (개선계획 단계만):
--    SELECT * FROM rsms.get_attachments_by_entity_phase('impl_inspection_items', '20250001A0001I000001', 'PLAN');
--
-- 5) 특정 단계의 첨부파일만 조회 (개선이행 단계만):
--    SELECT * FROM rsms.get_attachments_by_entity_phase('impl_inspection_items', '20250001A0001I000001', 'IMPL');
--
-- 6) 파일 다운로드 시 카운트 증가:
--    SELECT rsms.increment_download_count('ATT20251201000001', 'user001');
--
-- 7) 첨부파일 삭제 (소프트 삭제):
--    UPDATE rsms.attachments
--    SET is_active = 'N', updated_by = 'user001'
--    WHERE attachment_id = 'ATT20251201000001';
--
-- =====================================================
-- attachment_phase 코드값 정의:
-- =====================================================
-- PLAN  = 개선계획 단계 (improvement_status_cd = '02')
-- IMPL  = 개선이행 단계 (improvement_status_cd = '04')
-- FINAL = 최종점검 단계
-- NULL  = 단계 구분 없음 (일반 첨부)
-- =====================================================

-- =====================================================
-- 권한 설정
-- =====================================================
-- rsms_app 역할에 테이블 권한 부여
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.attachments TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
