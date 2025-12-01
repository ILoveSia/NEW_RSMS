-- ============================================
-- V016: attachments 테이블 생성
-- - 다형성 첨부파일 관리 (다양한 엔티티와 연결)
-- - entity_type, entity_id로 동적 관계 설정
-- - attachment_phase로 업무 단계 구분
-- ============================================

-- 첨부파일 테이블 생성
CREATE TABLE IF NOT EXISTS rsms.attachments (
    -- 기본키
    attachment_id VARCHAR(20) PRIMARY KEY,

    -- 다형성 관계 컬럼 (연결 엔티티 정보)
    entity_type VARCHAR(100) NOT NULL,           -- 연결된 테이블명 (예: impl_inspection_items)
    entity_id VARCHAR(100) NOT NULL,             -- 해당 엔티티의 PK
    attachment_phase VARCHAR(50),                -- 업무 단계 (PLAN, IMPL, FINAL 등)

    -- 파일 메타데이터
    file_name VARCHAR(500) NOT NULL,             -- 원본 파일명
    file_path VARCHAR(1000) NOT NULL,            -- 저장 경로
    stored_file_name VARCHAR(500) NOT NULL,      -- 저장 파일명 (UUID)
    file_extension VARCHAR(50),                  -- 파일 확장자
    file_size BIGINT NOT NULL,                   -- 파일 크기 (bytes)
    content_type VARCHAR(200),                   -- MIME 타입

    -- 파일 분류 및 설명
    file_category VARCHAR(50) DEFAULT 'ETC',     -- 파일 분류 (EVIDENCE, REPORT, REFERENCE, ETC)
    description VARCHAR(1000),                   -- 파일 설명
    sort_order INTEGER DEFAULT 0,                -- 정렬 순서

    -- 다운로드 추적
    download_count INTEGER DEFAULT 0,            -- 다운로드 횟수
    last_download_at TIMESTAMP,                  -- 마지막 다운로드 일시
    last_download_by VARCHAR(50),                -- 마지막 다운로드 사용자

    -- 공통 감사 필드
    is_active VARCHAR(1) NOT NULL DEFAULT 'Y',   -- 사용여부 (Y/N)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL
);

-- 인덱스 생성
-- 엔티티 타입 + ID 조합 인덱스 (가장 빈번한 조회 패턴)
CREATE INDEX IF NOT EXISTS idx_attachments_entity
ON rsms.attachments(entity_type, entity_id);

-- 엔티티 타입 + ID + 단계 조합 인덱스 (단계별 조회)
CREATE INDEX IF NOT EXISTS idx_attachments_entity_phase
ON rsms.attachments(entity_type, entity_id, attachment_phase);

-- 활성 상태 인덱스
CREATE INDEX IF NOT EXISTS idx_attachments_is_active
ON rsms.attachments(is_active);

-- 생성일시 인덱스 (최신 파일 조회)
CREATE INDEX IF NOT EXISTS idx_attachments_created_at
ON rsms.attachments(created_at DESC);

-- 테이블 코멘트
COMMENT ON TABLE rsms.attachments IS '첨부파일 테이블 - 다형성 관계로 다양한 엔티티와 연결';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.attachments.attachment_id IS '첨부파일ID (PK) - ATT + YYYYMMDD + 순번6자리';
COMMENT ON COLUMN rsms.attachments.entity_type IS '연결 엔티티 타입 (테이블명)';
COMMENT ON COLUMN rsms.attachments.entity_id IS '연결 엔티티 ID (해당 테이블 PK)';
COMMENT ON COLUMN rsms.attachments.attachment_phase IS '업무 단계 (PLAN:개선계획, IMPL:개선이행, FINAL:최종점검)';
COMMENT ON COLUMN rsms.attachments.file_name IS '원본 파일명';
COMMENT ON COLUMN rsms.attachments.file_path IS '서버 저장 경로';
COMMENT ON COLUMN rsms.attachments.stored_file_name IS '저장 파일명 (UUID 등)';
COMMENT ON COLUMN rsms.attachments.file_extension IS '파일 확장자';
COMMENT ON COLUMN rsms.attachments.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN rsms.attachments.content_type IS 'MIME 타입';
COMMENT ON COLUMN rsms.attachments.file_category IS '파일 분류 (EVIDENCE:증빙, REPORT:보고서, REFERENCE:참고, ETC:기타)';
COMMENT ON COLUMN rsms.attachments.description IS '파일 설명';
COMMENT ON COLUMN rsms.attachments.sort_order IS '정렬 순서';
COMMENT ON COLUMN rsms.attachments.download_count IS '다운로드 횟수';
COMMENT ON COLUMN rsms.attachments.last_download_at IS '마지막 다운로드 일시';
COMMENT ON COLUMN rsms.attachments.last_download_by IS '마지막 다운로드 사용자ID';
COMMENT ON COLUMN rsms.attachments.is_active IS '사용여부 (Y:사용, N:삭제)';
COMMENT ON COLUMN rsms.attachments.created_at IS '생성일시';
COMMENT ON COLUMN rsms.attachments.created_by IS '생성자ID';
COMMENT ON COLUMN rsms.attachments.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.attachments.updated_by IS '수정자ID';
