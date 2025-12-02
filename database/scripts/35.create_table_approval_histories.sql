
-- =====================================================
-- 결재 이력 테이블 (approval_histories) 생성
-- =====================================================
-- 설명: 결재 진행 이력 관리 테이블
-- 작성자: Claude AI
-- 작성일: 2025-12-02
-- 참고:
--   - approvals 테이블과 N:1 관계 (approval_id FK)
--   - 결재이력ID 코드 생성 규칙: AH + 순번(8자리)
--     예: AH00000001
--   - 처리코드(action_cd): DRAFT(기안), APPROVE(승인), REJECT(반려), WITHDRAW(회수), FORWARD(전달)
-- =====================================================

-- =====================================================
-- STEP 1: 결재이력ID 시퀀스 생성
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS rsms.seq_approval_history_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- STEP 2: 결재이력ID 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION rsms.generate_approval_history_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'AH' || LPAD(nextval('rsms.seq_approval_history_id')::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: approval_histories 테이블 생성
-- =====================================================

-- DROP TABLE IF EXISTS rsms.approval_histories CASCADE;

CREATE TABLE rsms.approval_histories (
    -- ============================================
    -- 기본키
    -- ============================================
    approval_history_id     VARCHAR(20)     PRIMARY KEY,            -- 결재이력ID (PK)

    -- ============================================
    -- 외래키
    -- ============================================
    approval_id             VARCHAR(20)     NOT NULL,               -- 결재ID (FK → approvals)

    -- ============================================
    -- 단계 정보
    -- ============================================
    step_sequence           INTEGER         NOT NULL,               -- 단계순서
    step_name               VARCHAR(100),                           -- 단계명
    step_type_cd            VARCHAR(10),                            -- 단계유형코드 (DRAFT, REVIEW, APPROVE, FINAL)

    -- ============================================
    -- 결재자 정보
    -- ============================================
    approver_id             VARCHAR(50)     NOT NULL,               -- 결재자ID
    approver_name           VARCHAR(100)    NOT NULL,               -- 결재자명
    approver_dept_id        VARCHAR(50),                            -- 결재자부서ID
    approver_dept_name      VARCHAR(100),                           -- 결재자부서명
    approver_position       VARCHAR(100),                           -- 결재자직책

    -- ============================================
    -- 결재 결과
    -- ============================================
    action_cd               VARCHAR(10)     NOT NULL,               -- 처리코드 (DRAFT: 기안, APPROVE: 승인, REJECT: 반려, WITHDRAW: 회수, FORWARD: 전달)
    action_date             TIMESTAMP       DEFAULT CURRENT_TIMESTAMP, -- 처리일시
    action_comment          VARCHAR(2000),                          -- 처리의견

    -- ============================================
    -- 대리결재 정보
    -- ============================================
    is_delegate_yn          CHAR(1)         DEFAULT 'N',            -- 대리결재여부
    delegate_from_id        VARCHAR(50),                            -- 위임자ID
    delegate_from_name      VARCHAR(100),                           -- 위임자명

    -- ============================================
    -- 공통 컬럼 (BaseEntity - 이력 테이블은 생성자/생성일시만 필요)
    -- ============================================
    created_by              VARCHAR(50)     NOT NULL,               -- 생성자
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시

    -- ============================================
    -- 제약조건
    -- ============================================
    CONSTRAINT chk_histories_action CHECK (action_cd IN ('DRAFT', 'APPROVE', 'REJECT', 'WITHDRAW', 'FORWARD')),
    CONSTRAINT chk_histories_is_delegate CHECK (is_delegate_yn IN ('Y', 'N')),
    CONSTRAINT chk_histories_step_type CHECK (step_type_cd IS NULL OR step_type_cd IN ('DRAFT', 'REVIEW', 'APPROVE', 'FINAL'))
);

-- =====================================================
-- STEP 4: 외래키 제약조건 추가
-- =====================================================

ALTER TABLE rsms.approval_histories
    ADD CONSTRAINT fk_approval_histories_approval
    FOREIGN KEY (approval_id)
    REFERENCES rsms.approvals(approval_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- STEP 5: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 결재ID 인덱스 (가장 중요)
CREATE INDEX idx_approval_histories_approval
    ON rsms.approval_histories(approval_id);

-- 결재자ID 인덱스
CREATE INDEX idx_approval_histories_approver
    ON rsms.approval_histories(approver_id);

-- 처리일시 인덱스
CREATE INDEX idx_approval_histories_action_date
    ON rsms.approval_histories(action_date);

-- 처리코드 인덱스
CREATE INDEX idx_approval_histories_action_cd
    ON rsms.approval_histories(action_cd);

-- 복합 인덱스: 결재ID + 단계순서 (결재이력 조회용)
CREATE INDEX idx_approval_histories_approval_step
    ON rsms.approval_histories(approval_id, step_sequence);

-- 복합 인덱스: 결재자 + 처리일시 (결재자별 이력 조회용)
CREATE INDEX idx_approval_histories_approver_date
    ON rsms.approval_histories(approver_id, action_date DESC);

-- =====================================================
-- STEP 6: 코멘트 추가
-- =====================================================

-- 테이블 코멘트
COMMENT ON TABLE rsms.approval_histories IS '결재 이력 테이블 - 결재 진행 이력 관리 (처리코드: DRAFT/APPROVE/REJECT/WITHDRAW/FORWARD)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.approval_histories.approval_history_id IS '결재이력ID (PK, 형식: AH + 순번8자리)';
COMMENT ON COLUMN rsms.approval_histories.approval_id IS '결재ID (FK → approvals.approval_id)';
COMMENT ON COLUMN rsms.approval_histories.step_sequence IS '단계순서';
COMMENT ON COLUMN rsms.approval_histories.step_name IS '단계명 (기안, 검토, 승인 등)';
COMMENT ON COLUMN rsms.approval_histories.step_type_cd IS '단계유형코드 (DRAFT: 기안, REVIEW: 검토, APPROVE: 승인, FINAL: 최종승인)';
COMMENT ON COLUMN rsms.approval_histories.approver_id IS '결재자ID';
COMMENT ON COLUMN rsms.approval_histories.approver_name IS '결재자명';
COMMENT ON COLUMN rsms.approval_histories.approver_dept_id IS '결재자부서ID';
COMMENT ON COLUMN rsms.approval_histories.approver_dept_name IS '결재자부서명';
COMMENT ON COLUMN rsms.approval_histories.approver_position IS '결재자직책';
COMMENT ON COLUMN rsms.approval_histories.action_cd IS '처리코드 (DRAFT: 기안, APPROVE: 승인, REJECT: 반려, WITHDRAW: 회수, FORWARD: 전달)';
COMMENT ON COLUMN rsms.approval_histories.action_date IS '처리일시';
COMMENT ON COLUMN rsms.approval_histories.action_comment IS '처리의견';
COMMENT ON COLUMN rsms.approval_histories.is_delegate_yn IS '대리결재여부 (Y/N)';
COMMENT ON COLUMN rsms.approval_histories.delegate_from_id IS '위임자ID';
COMMENT ON COLUMN rsms.approval_histories.delegate_from_name IS '위임자명';
COMMENT ON COLUMN rsms.approval_histories.created_by IS '생성자';
COMMENT ON COLUMN rsms.approval_histories.created_at IS '생성일시';

-- =====================================================
-- 권한 설정
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.approval_histories TO rsms_app;
-- GRANT USAGE, SELECT ON SEQUENCE rsms.seq_approval_history_id TO rsms_app;

-- =====================================================
-- 스크립트 완료
-- =====================================================
