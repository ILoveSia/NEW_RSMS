
-- =====================================================
-- 결재 문서 테이블 (approvals) 생성
-- =====================================================
-- 설명: 실제 결재 문서 관리 테이블
-- 작성자: Claude AI
-- 작성일: 2025-12-02
-- 참고:
--   - approval_lines 테이블과 N:1 관계 (approval_line_id FK)
--   - 결재ID 코드 생성 규칙: APR + 순번(8자리)
--     예: APR00000001
--   - 결재번호 생성 규칙: APR-연도-순번(5자리)
--     예: APR-2025-00001
--   - 결재상태코드: 01(기안), 02(진행중), 03(완료), 04(반려), 05(회수)
-- =====================================================

-- =====================================================
-- STEP 1: 결재ID 시퀀스 생성
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS rsms.seq_approval_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- STEP 2: 결재ID 및 결재번호 생성 함수
-- =====================================================

-- 결재ID 생성 함수
CREATE OR REPLACE FUNCTION rsms.generate_approval_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'APR' || LPAD(nextval('rsms.seq_approval_id')::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- 결재번호 생성 함수 (연도-순번 형식)
CREATE OR REPLACE FUNCTION rsms.generate_approval_no()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_year VARCHAR(4);
    v_seq INTEGER;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(approval_no FROM 10) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM rsms.approvals
    WHERE approval_no LIKE 'APR-' || v_year || '-%';

    RETURN 'APR-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: approvals 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.approvals CASCADE;

CREATE TABLE rsms.approvals (
    -- ============================================
    -- 기본키
    -- ============================================
    approval_id             VARCHAR(20)     PRIMARY KEY,            -- 결재ID (PK)

    -- ============================================
    -- 기본 정보
    -- ============================================
    approval_no             VARCHAR(50)     NOT NULL UNIQUE,        -- 결재번호 (APR-2025-00001 형식)
    title                   VARCHAR(500)    NOT NULL,               -- 제목
    content                 TEXT,                                   -- 내용

    -- ============================================
    -- 업무 정보
    -- ============================================
    work_type_cd            VARCHAR(10)     NOT NULL,               -- 업무구분코드 (WRS, IMPL, IMPROVE)
    approval_type_cd        VARCHAR(20)     NOT NULL,               -- 결재유형코드 (PLAN_APPROVAL: 계획승인, COMPLETE_APPROVAL: 완료승인, RESULT_APPROVAL: 결과승인)
    reference_type          VARCHAR(50)     NOT NULL,               -- 참조유형 (MGMT_ACTIVITY, IMPL_INSPECTION_ITEM 등) - 필수
    reference_id            VARCHAR(50)     NOT NULL,               -- 참조ID (원본 테이블의 PK) - 필수

    -- ============================================
    -- 결재선 정보
    -- ============================================
    approval_line_id        VARCHAR(20),                            -- 결재선ID (FK → approval_lines)

    -- ============================================
    -- 기안자 정보
    -- ============================================
    drafter_id              VARCHAR(50)     NOT NULL,               -- 기안자ID (사번)
    drafter_name            VARCHAR(100),                           -- 기안자명
    drafter_dept_id         VARCHAR(50),                            -- 기안자부서ID
    drafter_dept_name       VARCHAR(100),                           -- 기안자부서명
    drafter_position        VARCHAR(100),                           -- 기안자직책
    draft_date              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 기안일시

    -- ============================================
    -- 결재 진행 상태
    -- ============================================
    approval_status_cd      VARCHAR(10)     NOT NULL DEFAULT '01',  -- 결재상태코드 (01: 기안, 02: 진행중, 03: 완료, 04: 반려, 05: 회수)
    current_step            INTEGER         DEFAULT 1,              -- 현재단계
    total_steps             INTEGER         DEFAULT 1,              -- 총단계수

    -- ============================================
    -- 현재 결재자 정보
    -- ============================================
    current_approver_id     VARCHAR(50),                            -- 현결재자ID
    current_approver_name   VARCHAR(100),                           -- 현결재자명

    -- ============================================
    -- 최종 결재 정보
    -- ============================================
    final_approver_id       VARCHAR(50),                            -- 최종결재자ID
    final_approver_name     VARCHAR(100),                           -- 최종결재자명
    final_approval_date     TIMESTAMP,                              -- 최종결재일시

    -- ============================================
    -- 완료/반려/회수 정보
    -- ============================================
    completed_date          TIMESTAMP,                              -- 완료일시
    rejected_date           TIMESTAMP,                              -- 반려일시
    reject_reason           VARCHAR(1000),                          -- 반려사유
    withdrawn_date          TIMESTAMP,                              -- 회수일시

    -- ============================================
    -- 우선순위 및 마감일
    -- ============================================
    priority_cd             VARCHAR(10)     DEFAULT 'MEDIUM',       -- 우선순위 (HIGH, MEDIUM, LOW)
    due_date                DATE,                                   -- 완료예정일

    -- ============================================
    -- 상태 정보
    -- ============================================
    is_active               CHAR(1)         DEFAULT 'Y',            -- 사용여부 (Y/N)

    -- ============================================
    -- 공통 컬럼 (BaseEntity)
    -- ============================================
    created_by              VARCHAR(50)     NOT NULL,               -- 생성자
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
    updated_by              VARCHAR(50),                            -- 수정자
    updated_at              TIMESTAMP       DEFAULT CURRENT_TIMESTAMP, -- 수정일시

    -- ============================================
    -- 제약조건
    -- ============================================
    CONSTRAINT chk_approvals_status CHECK (approval_status_cd IN ('01', '02', '03', '04', '05')),
    CONSTRAINT chk_approvals_priority CHECK (priority_cd IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_approvals_is_active CHECK (is_active IN ('Y', 'N')),
    CONSTRAINT chk_approvals_work_type CHECK (work_type_cd IN ('WRS', 'IMPL', 'IMPROVE')),
    CONSTRAINT chk_approvals_approval_type CHECK (approval_type_cd IN ('PLAN_APPROVAL', 'COMPLETE_APPROVAL', 'RESULT_APPROVAL'))
);

-- =====================================================
-- STEP 4: 외래키 제약조건 추가
-- =====================================================

ALTER TABLE rsms.approvals
    ADD CONSTRAINT fk_approvals_line
    FOREIGN KEY (approval_line_id)
    REFERENCES rsms.approval_lines(approval_line_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- STEP 5: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 결재번호 인덱스
CREATE INDEX idx_approvals_approval_no
    ON rsms.approvals(approval_no);

-- 업무구분코드 인덱스
CREATE INDEX idx_approvals_work_type
    ON rsms.approvals(work_type_cd);

-- 결재유형코드 인덱스
CREATE INDEX idx_approvals_approval_type
    ON rsms.approvals(approval_type_cd);

-- 결재상태코드 인덱스
CREATE INDEX idx_approvals_status
    ON rsms.approvals(approval_status_cd);

-- 기안자ID 인덱스
CREATE INDEX idx_approvals_drafter
    ON rsms.approvals(drafter_id);

-- 현결재자ID 인덱스
CREATE INDEX idx_approvals_current_approver
    ON rsms.approvals(current_approver_id);

-- 기안일시 인덱스
CREATE INDEX idx_approvals_draft_date
    ON rsms.approvals(draft_date);

-- 참조유형 + 참조ID 복합 인덱스
CREATE INDEX idx_approvals_reference
    ON rsms.approvals(reference_type, reference_id);

-- 사용여부 인덱스
CREATE INDEX idx_approvals_is_active
    ON rsms.approvals(is_active);

-- 복합 인덱스: 기안자 + 결재상태 (기안함 조회용)
CREATE INDEX idx_approvals_drafter_status
    ON rsms.approvals(drafter_id, approval_status_cd);

-- 복합 인덱스: 현결재자 + 결재상태 (결재대기함 조회용)
CREATE INDEX idx_approvals_approver_status
    ON rsms.approvals(current_approver_id, approval_status_cd);

-- =====================================================
-- STEP 6: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.approvals IS '결재 문서 테이블 - 실제 결재 문서 관리 (결재번호: APR-연도-순번)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.approvals.approval_id IS '결재ID (PK, 형식: APR + 순번8자리)';
COMMENT ON COLUMN rsms.approvals.approval_no IS '결재번호 (형식: APR-연도-순번5자리, 예: APR-2025-00001)';
COMMENT ON COLUMN rsms.approvals.title IS '제목';
COMMENT ON COLUMN rsms.approvals.content IS '내용';
COMMENT ON COLUMN rsms.approvals.work_type_cd IS '업무구분코드 (WRS: 책무구조, IMPL: 이행점검, IMPROVE: 개선이행)';
COMMENT ON COLUMN rsms.approvals.approval_type_cd IS '결재유형코드 (PLAN_APPROVAL: 계획승인, COMPLETE_APPROVAL: 완료승인, RESULT_APPROVAL: 결과승인)';
COMMENT ON COLUMN rsms.approvals.reference_type IS '참조유형 (MGMT_ACTIVITY, IMPL_INSPECTION 등)';
COMMENT ON COLUMN rsms.approvals.reference_id IS '참조ID (관리활동ID, 점검ID 등)';
COMMENT ON COLUMN rsms.approvals.approval_line_id IS '결재선ID (FK → approval_lines.approval_line_id)';
COMMENT ON COLUMN rsms.approvals.drafter_id IS '기안자ID (사번)';
COMMENT ON COLUMN rsms.approvals.drafter_name IS '기안자명';
COMMENT ON COLUMN rsms.approvals.drafter_dept_id IS '기안자부서ID';
COMMENT ON COLUMN rsms.approvals.drafter_dept_name IS '기안자부서명';
COMMENT ON COLUMN rsms.approvals.drafter_position IS '기안자직책';
COMMENT ON COLUMN rsms.approvals.draft_date IS '기안일시';
COMMENT ON COLUMN rsms.approvals.approval_status_cd IS '결재상태코드 (01: 기안, 02: 진행중, 03: 완료, 04: 반려, 05: 회수)';
COMMENT ON COLUMN rsms.approvals.current_step IS '현재단계';
COMMENT ON COLUMN rsms.approvals.total_steps IS '총단계수';
COMMENT ON COLUMN rsms.approvals.current_approver_id IS '현결재자ID';
COMMENT ON COLUMN rsms.approvals.current_approver_name IS '현결재자명';
COMMENT ON COLUMN rsms.approvals.final_approver_id IS '최종결재자ID';
COMMENT ON COLUMN rsms.approvals.final_approver_name IS '최종결재자명';
COMMENT ON COLUMN rsms.approvals.final_approval_date IS '최종결재일시';
COMMENT ON COLUMN rsms.approvals.completed_date IS '완료일시';
COMMENT ON COLUMN rsms.approvals.rejected_date IS '반려일시';
COMMENT ON COLUMN rsms.approvals.reject_reason IS '반려사유';
COMMENT ON COLUMN rsms.approvals.withdrawn_date IS '회수일시';
COMMENT ON COLUMN rsms.approvals.priority_cd IS '우선순위 (HIGH: 높음, MEDIUM: 보통, LOW: 낮음)';
COMMENT ON COLUMN rsms.approvals.due_date IS '완료예정일';
COMMENT ON COLUMN rsms.approvals.is_active IS '사용여부 (Y/N)';
COMMENT ON COLUMN rsms.approvals.created_by IS '생성자';
COMMENT ON COLUMN rsms.approvals.created_at IS '생성일시';
COMMENT ON COLUMN rsms.approvals.updated_by IS '수정자';
COMMENT ON COLUMN rsms.approvals.updated_at IS '수정일시';

-- =====================================================
-- STEP 7: 트리거 생성 (updated_at 자동 갱신)
-- =====================================================

CREATE TRIGGER trigger_approvals_updated_at
    BEFORE UPDATE ON rsms.approvals
    FOR EACH ROW
    EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================
-- 권한 설정
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.approvals TO rsms_app;
-- GRANT USAGE, SELECT ON SEQUENCE rsms.seq_approval_id TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
