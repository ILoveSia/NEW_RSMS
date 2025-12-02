
-- =====================================================
-- 결재선 마스터 테이블 (approval_lines) 생성
-- =====================================================
-- 설명: 결재선 정의 및 관리 테이블
-- 작성자: Claude AI
-- 작성일: 2025-12-02
-- 참고:
--   - 업무구분별 결재선 정의 (WRS: 책무구조, IMPL: 이행점검, IMPROVE: 개선이행)
--   - 결재선ID 코드 생성 규칙: AL + 순번(8자리)
--     예: AL00000001
-- =====================================================

-- =====================================================
-- STEP 1: 결재선ID 시퀀스 생성
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS rsms.seq_approval_line_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- STEP 2: 결재선ID 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION rsms.generate_approval_line_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'AL' || LPAD(nextval('rsms.seq_approval_line_id')::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: approval_lines 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.approval_lines CASCADE;

CREATE TABLE rsms.approval_lines (
    -- ============================================
    -- 기본키
    -- ============================================
    approval_line_id        VARCHAR(20)     PRIMARY KEY,            -- 결재선ID (PK)

    -- ============================================
    -- 기본 정보
    -- ============================================
    approval_line_name      VARCHAR(100)    NOT NULL,               -- 결재선명
    work_type_cd            VARCHAR(10)     NOT NULL,               -- 업무구분코드 (WRS: 책무구조, IMPL: 이행점검, IMPROVE: 개선이행)
    popup_title             VARCHAR(200),                           -- Popup 제목
    description             VARCHAR(500),                           -- 설명

    -- ============================================
    -- URL 정보
    -- ============================================
    popup_url               VARCHAR(500),                           -- Popup URL

    -- ============================================
    -- 설정 정보
    -- ============================================
    is_popup_yn             CHAR(1)         DEFAULT 'N',            -- 팝업여부 (Y/N)
    is_editable_yn          CHAR(1)         DEFAULT 'Y',            -- 수정가능여부 (Y/N)
    is_required_yn          CHAR(1)         DEFAULT 'Y',            -- 필수여부 (Y/N)
    sort_order              INTEGER         DEFAULT 1,              -- 정렬순서

    -- ============================================
    -- 상태 정보
    -- ============================================
    is_active               CHAR(1)         DEFAULT 'Y',            -- 사용여부 (Y/N)
    remarks                 VARCHAR(500),                           -- 비고

    -- ============================================
    -- 공통 컬럼 (BaseEntity)
    -- ============================================
    created_by              VARCHAR(50)     NOT NULL,               -- 생성자
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
    updated_by              VARCHAR(50)     NOT NULL,               -- 수정자
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

    -- ============================================
    -- 제약조건
    -- ============================================
    CONSTRAINT chk_approval_lines_is_popup CHECK (is_popup_yn IN ('Y', 'N')),
    CONSTRAINT chk_approval_lines_is_editable CHECK (is_editable_yn IN ('Y', 'N')),
    CONSTRAINT chk_approval_lines_is_required CHECK (is_required_yn IN ('Y', 'N')),
    CONSTRAINT chk_approval_lines_is_active CHECK (is_active IN ('Y', 'N')),
    CONSTRAINT chk_approval_lines_work_type CHECK (work_type_cd IN ('WRS', 'IMPL', 'IMPROVE'))
);

-- =====================================================
-- STEP 4: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 업무구분코드 인덱스
CREATE INDEX idx_approval_lines_work_type
    ON rsms.approval_lines(work_type_cd);

-- 사용여부 인덱스
CREATE INDEX idx_approval_lines_is_active
    ON rsms.approval_lines(is_active);

-- 정렬순서 인덱스
CREATE INDEX idx_approval_lines_sort_order
    ON rsms.approval_lines(sort_order);

-- 복합 인덱스: 업무구분 + 사용여부
CREATE INDEX idx_approval_lines_work_type_active
    ON rsms.approval_lines(work_type_cd, is_active);

-- =====================================================
-- STEP 5: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.approval_lines IS '결재선 마스터 테이블 - 업무구분별 결재선 정의 및 관리';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.approval_lines.approval_line_id IS '결재선ID (PK, 형식: AL + 순번8자리)';
COMMENT ON COLUMN rsms.approval_lines.approval_line_name IS '결재선명';
COMMENT ON COLUMN rsms.approval_lines.work_type_cd IS '업무구분코드 (WRS: 책무구조, IMPL: 이행점검, IMPROVE: 개선이행)';
COMMENT ON COLUMN rsms.approval_lines.popup_title IS 'Popup 제목';
COMMENT ON COLUMN rsms.approval_lines.description IS '설명';
COMMENT ON COLUMN rsms.approval_lines.popup_url IS 'Popup URL';
COMMENT ON COLUMN rsms.approval_lines.is_popup_yn IS '팝업여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_lines.is_editable_yn IS '수정가능여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_lines.is_required_yn IS '필수여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_lines.sort_order IS '정렬순서';
COMMENT ON COLUMN rsms.approval_lines.is_active IS '사용여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_lines.remarks IS '비고';
COMMENT ON COLUMN rsms.approval_lines.created_by IS '생성자';
COMMENT ON COLUMN rsms.approval_lines.created_at IS '생성일시';
COMMENT ON COLUMN rsms.approval_lines.updated_by IS '수정자';
COMMENT ON COLUMN rsms.approval_lines.updated_at IS '수정일시';

-- =====================================================
-- STEP 6: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_approval_lines_updated_at
    BEFORE UPDATE ON rsms.approval_lines
    FOR EACH ROW
    EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 7: 초기 데이터 삽입
-- =====================================================

INSERT INTO rsms.approval_lines (
    approval_line_id,
    approval_line_name,
    work_type_cd,
    popup_title,
    description,
    is_popup_yn,
    is_editable_yn,
    is_required_yn,
    sort_order,
    is_active,
    created_by,
    updated_by
) VALUES
-- 책무구조 결재선
('AL00000001', '관리활동 결재', 'WRS', '관리활동 결재', '책무구조 관리활동 결재선', 'Y', 'Y', 'Y', 1, 'Y', 'SYSTEM', 'SYSTEM'),
('AL00000002', '책무배분 결재', 'WRS', '책무배분 결재', '책무구조 책무배분 결재선', 'Y', 'Y', 'Y', 2, 'Y', 'SYSTEM', 'SYSTEM'),

-- 이행점검 결재선
('AL00000003', '점검결과 결재', 'IMPL', '이행점검 결과 결재', '이행점검 결과 결재선', 'Y', 'Y', 'Y', 3, 'Y', 'SYSTEM', 'SYSTEM'),
('AL00000004', '점검계획 결재', 'IMPL', '이행점검 계획 결재', '이행점검 계획 결재선', 'Y', 'Y', 'Y', 4, 'Y', 'SYSTEM', 'SYSTEM'),

-- 개선이행 결재선
('AL00000005', '개선계획 결재', 'IMPROVE', '개선계획 승인 결재', '개선이행 계획 결재선', 'Y', 'Y', 'Y', 5, 'Y', 'SYSTEM', 'SYSTEM'),
('AL00000006', '개선완료 결재', 'IMPROVE', '개선완료 승인 결재', '개선이행 완료 결재선', 'Y', 'Y', 'Y', 6, 'Y', 'SYSTEM', 'SYSTEM');

-- =====================================================
-- 권한 설정
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.approval_lines TO rsms_app;
-- GRANT USAGE, SELECT ON SEQUENCE rsms.seq_approval_line_id TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
