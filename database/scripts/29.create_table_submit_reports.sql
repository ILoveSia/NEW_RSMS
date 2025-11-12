-- =============================================
-- 제출보고서 관리 테이블 생성
-- 정부기관(금융감독원 등)에 제출하는 각종 보고서 관리
-- =============================================

-- 테이블 생성
CREATE TABLE rsms.submit_reports (
    -- 기본키
    report_id BIGSERIAL PRIMARY KEY,

    -- 외래키
    ledger_order_id BIGINT NOT NULL,

    -- 기본정보
    submitting_agency VARCHAR(200) NOT NULL COMMENT '제출기관 (예: 금융감독원)',
    report_type VARCHAR(200) NOT NULL COMMENT '제출보고서구분 (책무기재내용 변경 보고서, 임원 변경 보고서 등)',
    target_executive_emp_no VARCHAR(20) COMMENT '제출 대상 임원 사번',
    target_executive_name VARCHAR(100) COMMENT '제출 대상 임원명 (비정규화)',
    position_id BIGINT COMMENT '임원 직책ID',
    position_name VARCHAR(100) COMMENT '직책명 (비정규화)',
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE COMMENT '제출일',
    remarks TEXT COMMENT '비고',

    -- 감사 필드 (audit fields)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(100) NOT NULL COMMENT '생성자',
    updated_by VARCHAR(100) NOT NULL COMMENT '수정자',
    version INTEGER NOT NULL DEFAULT 1 COMMENT '버전',

    -- 외래키 제약조건
    CONSTRAINT fk_submit_reports_ledger_order
        FOREIGN KEY (ledger_order_id)
        REFERENCES rsms.ledger_orders(ledger_order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_submit_reports_position
        FOREIGN KEY (position_id)
        REFERENCES rsms.positions(positions_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 테이블 코멘트
COMMENT ON TABLE rsms.submit_reports IS '제출보고서 관리 - 금융감독원 등 정부기관에 제출하는 각종 보고서 관리';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.submit_reports.report_id IS '보고서ID (PK)';
COMMENT ON COLUMN rsms.submit_reports.ledger_order_id IS '원장차수ID (FK)';
COMMENT ON COLUMN rsms.submit_reports.submitting_agency IS '제출기관 (예: 금융감독원, 금융위원회)';
COMMENT ON COLUMN rsms.submit_reports.report_type IS '제출보고서구분 (책무기재내용 변경 보고서, 임원 변경 보고서, 조직 변경 보고서 등)';
COMMENT ON COLUMN rsms.submit_reports.target_executive_emp_no IS '제출 대상 임원 사번';
COMMENT ON COLUMN rsms.submit_reports.target_executive_name IS '제출 대상 임원명 (조회 성능 최적화를 위한 비정규화)';
COMMENT ON COLUMN rsms.submit_reports.position_id IS '임원 직책ID (FK)';
COMMENT ON COLUMN rsms.submit_reports.position_name IS '직책명 (조회 성능 최적화를 위한 비정규화)';
COMMENT ON COLUMN rsms.submit_reports.submission_date IS '제출일';
COMMENT ON COLUMN rsms.submit_reports.remarks IS '비고 (특이사항, 추가 설명)';
COMMENT ON COLUMN rsms.submit_reports.created_at IS '생성일시';
COMMENT ON COLUMN rsms.submit_reports.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.submit_reports.created_by IS '생성자';
COMMENT ON COLUMN rsms.submit_reports.updated_by IS '수정자';
COMMENT ON COLUMN rsms.submit_reports.version IS '낙관적 잠금을 위한 버전';

-- 인덱스 생성
-- 1. 원장차수별 조회 (가장 빈번한 조회 패턴)
CREATE INDEX idx_submit_reports_ledger_order
    ON rsms.submit_reports(ledger_order_id);

-- 2. 제출일별 조회
CREATE INDEX idx_submit_reports_submission_date
    ON rsms.submit_reports(submission_date);

-- 3. 보고서 유형별 조회
CREATE INDEX idx_submit_reports_type
    ON rsms.submit_reports(report_type);

-- 4. 대상 임원별 조회
CREATE INDEX idx_submit_reports_executive
    ON rsms.submit_reports(target_executive_emp_no);

-- 5. 직책별 조회
CREATE INDEX idx_submit_reports_position
    ON rsms.submit_reports(position_id);

-- 6. 복합 인덱스: 원장차수 + 제출일 (기간별 조회)
CREATE INDEX idx_submit_reports_ledger_date
    ON rsms.submit_reports(ledger_order_id, submission_date);

-- 7. 복합 인덱스: 원장차수 + 보고서유형
CREATE INDEX idx_submit_reports_ledger_type
    ON rsms.submit_reports(ledger_order_id, report_type);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_submit_reports_updated_at
    BEFORE UPDATE ON rsms.submit_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (테스트용)
-- INSERT INTO rsms.submit_reports (
--     ledger_order_id,
--     submitting_agency,
--     report_type,
--     target_executive_emp_no,
--     target_executive_name,
--     position_id,
--     position_name,
--     submission_date,
--     remarks,
--     created_by,
--     updated_by
-- ) VALUES (
--     1,
--     '금융감독원',
--     '책무기재내용 변경 보고서',
--     'EMP001',
--     '홍길동',
--     1,
--     'CEO',
--     CURRENT_DATE,
--     '2024년 1분기 책무 변경사항 반영',
--     'admin',
--     'admin'
-- );

-- 테이블 생성 확인
SELECT
    table_name,
    table_comment
FROM information_schema.tables
WHERE table_schema = 'rsms'
    AND table_name = 'submit_reports';

-- 컬럼 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    column_comment
FROM information_schema.columns
WHERE table_schema = 'rsms'
    AND table_name = 'submit_reports'
ORDER BY ordinal_position;
