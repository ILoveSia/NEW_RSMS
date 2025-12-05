
-- =====================================================
-- 결재선 단계 테이블 (approval_line_steps) 생성
-- =====================================================
-- 설명: 결재선별 결재 단계 정의 테이블
-- 작성자: Claude AI
-- 작성일: 2025-12-02
-- 참고:
--   - approval_lines 테이블과 N:1 관계 (approval_line_id FK)
--   - 결재선단계ID 코드 생성 규칙: ALS + 순번(8자리)
--     예: ALS00000001
--   - 단계유형코드: DRAFT(기안), REVIEW(검토), APPROVE(승인), FINAL(최종승인)
--   - 결재자유형코드: USER(개인), POSITION(직책), DEPT(부서장)
-- =====================================================

-- =====================================================
-- STEP 1: 결재선단계ID 시퀀스 생성
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS rsms.seq_approval_line_step_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- STEP 2: 결재선단계ID 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION rsms.generate_approval_line_step_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'ALS' || LPAD(nextval('rsms.seq_approval_line_step_id')::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: approval_line_steps 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.approval_line_steps CASCADE;

CREATE TABLE rsms.approval_line_steps (
    -- ============================================
    -- 기본키
    -- ============================================
    approval_line_step_id   VARCHAR(20)     PRIMARY KEY,            -- 결재선단계ID (PK)

    -- ============================================
    -- 외래키
    -- ============================================
    approval_line_id        VARCHAR(20)     NOT NULL,               -- 결재선ID (FK → approval_lines)

    -- ============================================
    -- 단계 정보
    -- ============================================
    step_sequence           INTEGER         NOT NULL,               -- 단계순서
    step_name               VARCHAR(100)    NOT NULL,               -- 단계명 (기안, 검토, 승인 등)
    step_type_cd            VARCHAR(10)     NOT NULL,               -- 단계유형코드 (DRAFT: 기안, REVIEW: 검토, APPROVE: 승인, FINAL: 최종승인) APR_STP_TYCD

    -- ============================================
    -- 결재자 정보
    -- ============================================
    approver_type_cd        VARCHAR(10)     NOT NULL,               -- 결재자유형코드 (USER: 개인, POSITION: 직책, DEPT: 부서장)
    approver_id             VARCHAR(50),                            -- 결재자ID (사번 또는 직책ID)
    approver_name           VARCHAR(100),                           -- 결재자명

    -- ============================================
    -- 설정 정보
    -- ============================================
    is_required_yn          CHAR(1)         DEFAULT 'Y',            -- 필수여부 (Y/N)
    is_parallel_yn          CHAR(1)         DEFAULT 'N',            -- 병렬결재여부 (Y/N)
    is_skip_allowed_yn      CHAR(1)         DEFAULT 'N',            -- 건너뛰기허용여부 (Y/N)

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
    CONSTRAINT chk_step_is_required CHECK (is_required_yn IN ('Y', 'N')),
    CONSTRAINT chk_step_is_parallel CHECK (is_parallel_yn IN ('Y', 'N')),
    CONSTRAINT chk_step_is_skip_allowed CHECK (is_skip_allowed_yn IN ('Y', 'N')),
    CONSTRAINT chk_step_is_active CHECK (is_active IN ('Y', 'N')),
    CONSTRAINT chk_step_type_cd CHECK (step_type_cd IN ('DRAFT', 'REVIEW', 'APPROVE', 'FINAL')),
    CONSTRAINT chk_approver_type_cd CHECK (approver_type_cd IN ('USER', 'POSITION', 'DEPT'))
);

-- =====================================================
-- STEP 4: 외래키 제약조건 추가
-- =====================================================

ALTER TABLE rsms.approval_line_steps
    ADD CONSTRAINT fk_approval_line_steps_line
    FOREIGN KEY (approval_line_id)
    REFERENCES rsms.approval_lines(approval_line_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- STEP 5: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 결재선ID 인덱스
CREATE INDEX idx_approval_line_steps_line_id
    ON rsms.approval_line_steps(approval_line_id);

-- 단계순서 복합 인덱스
CREATE INDEX idx_approval_line_steps_sequence
    ON rsms.approval_line_steps(approval_line_id, step_sequence);

-- 결재선ID + 단계순서 유니크 인덱스
CREATE UNIQUE INDEX uk_approval_line_steps_order
    ON rsms.approval_line_steps(approval_line_id, step_sequence);

-- 단계유형코드 인덱스
CREATE INDEX idx_approval_line_steps_type
    ON rsms.approval_line_steps(step_type_cd);

-- 사용여부 인덱스
CREATE INDEX idx_approval_line_steps_is_active
    ON rsms.approval_line_steps(is_active);

-- =====================================================
-- STEP 6: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.approval_line_steps IS '결재선 단계 테이블 - 결재선별 결재 단계 정의';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.approval_line_steps.approval_line_step_id IS '결재선단계ID (PK, 형식: ALS + 순번8자리)';
COMMENT ON COLUMN rsms.approval_line_steps.approval_line_id IS '결재선ID (FK → approval_lines.approval_line_id)';
COMMENT ON COLUMN rsms.approval_line_steps.step_sequence IS '단계순서';
COMMENT ON COLUMN rsms.approval_line_steps.step_name IS '단계명 (기안, 검토, 승인 등)';
COMMENT ON COLUMN rsms.approval_line_steps.step_type_cd IS '단계유형코드 (DRAFT: 기안, REVIEW: 검토, APPROVE: 승인, FINAL: 최종승인)';
COMMENT ON COLUMN rsms.approval_line_steps.approver_type_cd IS '결재자유형코드 (USER: 개인, POSITION: 직책, DEPT: 부서장)';
COMMENT ON COLUMN rsms.approval_line_steps.approver_id IS '결재자ID (사번 또는 직책ID)';
COMMENT ON COLUMN rsms.approval_line_steps.approver_name IS '결재자명';
COMMENT ON COLUMN rsms.approval_line_steps.is_required_yn IS '필수여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_line_steps.is_parallel_yn IS '병렬결재여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_line_steps.is_skip_allowed_yn IS '건너뛰기허용여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_line_steps.is_active IS '사용여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_line_steps.remarks IS '비고';
COMMENT ON COLUMN rsms.approval_line_steps.created_by IS '생성자';
COMMENT ON COLUMN rsms.approval_line_steps.created_at IS '생성일시';
COMMENT ON COLUMN rsms.approval_line_steps.updated_by IS '수정자';
COMMENT ON COLUMN rsms.approval_line_steps.updated_at IS '수정일시';

-- =====================================================
-- STEP 7: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_approval_line_steps_updated_at
    BEFORE UPDATE ON rsms.approval_line_steps
    FOR EACH ROW
    EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- STEP 8: 초기 데이터 삽입
-- =====================================================

INSERT INTO rsms.approval_line_steps (
    approval_line_step_id,
    approval_line_id,
    step_sequence,
    step_name,
    step_type_cd,
    approver_type_cd,
    is_required_yn,
    is_active,
    created_by,
    updated_by
) VALUES
-- 관리활동 결재선 단계 (AL00000001)
('ALS00000001', 'AL00000001', 1, '기안', 'DRAFT', 'USER', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),
('ALS00000002', 'AL00000001', 2, '검토', 'REVIEW', 'DEPT', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),
('ALS00000003', 'AL00000001', 3, '승인', 'APPROVE', 'POSITION', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),

-- 개선계획 결재선 단계 (AL00000005)
('ALS00000004', 'AL00000005', 1, '기안', 'DRAFT', 'USER', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),
('ALS00000005', 'AL00000005', 2, '승인', 'APPROVE', 'USER', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),

-- 개선완료 결재선 단계 (AL00000006)
('ALS00000006', 'AL00000006', 1, '기안', 'DRAFT', 'USER', 'Y', 'Y', 'SYSTEM', 'SYSTEM'),
('ALS00000007', 'AL00000006', 2, '최종승인', 'FINAL', 'USER', 'Y', 'Y', 'SYSTEM', 'SYSTEM');

-- =====================================================
-- 권한 설정
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.approval_line_steps TO rsms_app;
-- GRANT USAGE, SELECT ON SEQUENCE rsms.seq_approval_line_step_id TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
