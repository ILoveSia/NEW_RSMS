-- =====================================================
-- 제출보고서 테이블 (submit_reports)
-- =====================================================
-- 설명: 정부기관(금융감독원 등)에 제출하는 각종 보고서 관리
-- 작성자: Claude AI
-- 작성일: 2025-11-26
-- 참고:
--   - 원장차수별로 제출보고서를 관리
--   - 제출기관코드는 common_code_details에서 group_code='SUB_AGENCY_CD'로 관리
--   - 제출보고서구분코드는 common_code_details에서 group_code='SUB_REPORT_TYCD'로 관리
--   - 조회 성능 최적화를 위해 임원명, 직책명 비정규화
-- =====================================================

-- DROP TABLE IF EXISTS rsms.submit_reports CASCADE;

CREATE TABLE rsms.submit_reports (
  -- 기본키
  report_id BIGSERIAL PRIMARY KEY,                     -- 보고서ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  submitting_agency_cd VARCHAR(20) NOT NULL,           -- 제출기관코드 (common_code_details의 SUB_AGENCY_CD 그룹 참조)
  report_type_cd VARCHAR(20) NOT NULL,                 -- 제출보고서구분코드 (common_code_details의 SUB_REPORT_TYCD 그룹 참조)
  sub_report_title VARCHAR(100),                       -- 제출보고서 제목
  target_executive_emp_no VARCHAR(20),                 -- 제출 대상 임원 사번
  target_executive_name VARCHAR(100),                  -- 제출 대상 임원명 (비정규화)
  position_id BIGINT,                                  -- 임원 직책ID (FK → positions)
  position_name VARCHAR(100),                          -- 직책명 (비정규화)
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- 제출일
  remarks TEXT,                                        -- 비고

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_submit_reports_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_submit_reports_position
    FOREIGN KEY (position_id)
    REFERENCES rsms.positions(positions_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_submit_reports_ledger_order_id ON rsms.submit_reports(ledger_order_id);
CREATE INDEX idx_submit_reports_submission_date ON rsms.submit_reports(submission_date);
CREATE INDEX idx_submit_reports_report_type_cd ON rsms.submit_reports(report_type_cd);
CREATE INDEX idx_submit_reports_target_executive_emp_no ON rsms.submit_reports(target_executive_emp_no);
CREATE INDEX idx_submit_reports_position_id ON rsms.submit_reports(position_id);
CREATE INDEX idx_submit_reports_submitting_agency_cd ON rsms.submit_reports(submitting_agency_cd);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_submit_reports_ledger_date ON rsms.submit_reports(ledger_order_id, submission_date);
CREATE INDEX idx_submit_reports_ledger_type ON rsms.submit_reports(ledger_order_id, report_type_cd);

-- 코멘트 추가
COMMENT ON TABLE rsms.submit_reports IS '제출보고서 테이블 - 금융감독원 등 정부기관에 제출하는 각종 보고서 관리';
COMMENT ON COLUMN rsms.submit_reports.report_id IS '보고서ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.submit_reports.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.submit_reports.submitting_agency_cd IS '제출기관코드 (common_code_details의 SUB_AGENCY_CD 그룹 참조)';
COMMENT ON COLUMN rsms.submit_reports.report_type_cd IS '제출보고서구분코드 (common_code_details의 SUB_REPORT_TYCD 그룹 참조)';
COMMENT ON COLUMN rsms.submit_reports.sub_report_title IS '제출보고서 제목';
COMMENT ON COLUMN rsms.submit_reports.target_executive_emp_no IS '제출 대상 임원 사번';
COMMENT ON COLUMN rsms.submit_reports.target_executive_name IS '제출 대상 임원명 (조회 성능 최적화를 위한 비정규화)';
COMMENT ON COLUMN rsms.submit_reports.position_id IS '임원 직책ID (FK → positions)';
COMMENT ON COLUMN rsms.submit_reports.position_name IS '직책명 (조회 성능 최적화를 위한 비정규화)';
COMMENT ON COLUMN rsms.submit_reports.submission_date IS '제출일';
COMMENT ON COLUMN rsms.submit_reports.remarks IS '비고 (특이사항, 추가 설명)';
COMMENT ON COLUMN rsms.submit_reports.created_by IS '생성자';
COMMENT ON COLUMN rsms.submit_reports.created_at IS '생성일시';
COMMENT ON COLUMN rsms.submit_reports.updated_by IS '수정자';
COMMENT ON COLUMN rsms.submit_reports.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신 (공통 함수 사용)
CREATE TRIGGER trg_submit_reports_updated_at
  BEFORE UPDATE ON rsms.submit_reports
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- 샘플 데이터 (선택사항 - 필요시 주석 해제)
-- 참고: ledger_order, positions, common_code_details에 데이터가 미리 등록되어 있어야 함
/*
INSERT INTO rsms.submit_reports (
  ledger_order_id, submitting_agency_cd, report_type_cd, sub_report_title,
  target_executive_emp_no, target_executive_name, position_id, position_name,
  submission_date, remarks, created_by, updated_by
) VALUES (
  '20250001', 'FSS', 'RESP_CHG', '2024년 1분기 책무기재내용 변경 보고서',
  'EMP001', '홍길동', 1, 'CEO',
  CURRENT_DATE, '2024년 1분기 책무 변경사항 반영',
  'SYSTEM', 'SYSTEM'
);
*/

-- 사용 예시 주석
--
-- 1. 데이터 삽입 (report_id는 자동 생성됨):
-- INSERT INTO rsms.submit_reports (ledger_order_id, submitting_agency_cd, report_type_cd, created_by, updated_by)
-- VALUES ('20250001', 'FSS', 'RESP_CHG', 'ADMIN', 'ADMIN');
--
-- 2. 원장차수별 보고서 조회:
-- SELECT * FROM rsms.submit_reports WHERE ledger_order_id = '20250001';
--
-- 3. 제출일 기간별 조회:
-- SELECT * FROM rsms.submit_reports
-- WHERE submission_date BETWEEN '2025-01-01' AND '2025-12-31';
--
-- 4. 제출기관별 조회:
-- SELECT * FROM rsms.submit_reports WHERE submitting_agency_cd = 'FSS';
--
-- 5. 보고서 유형별 조회:
-- SELECT * FROM rsms.submit_reports WHERE report_type_cd = 'RESP_CHG';
--
-- 6. 특정 임원의 보고서 조회:
-- SELECT * FROM rsms.submit_reports WHERE target_executive_emp_no = 'EMP001';
