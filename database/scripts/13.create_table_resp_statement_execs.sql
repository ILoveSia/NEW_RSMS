-- =====================================================================================
-- 13. resp_statement_execs 테이블 생성 (책무기술서_임원_정보 테이블)
-- =====================================================================================
-- 설명: 직책에 대한 책무기술서 임원정보를 관리하는 테이블 (positions와 1:1 관계)
-- 작성일: 2025-09-24
-- =====================================================================================

-- 기존 테이블이 존재하면 삭제 (개발 환경에서만 사용, 운영 환경에서는 주석 처리 필요)
DROP TABLE IF EXISTS rsms.resp_statement_execs CASCADE;

-- resp_statement_execs 테이블 생성
CREATE TABLE rsms.resp_statement_execs (
  -- 기본키 (대리키)
  resp_stmt_exec_id BIGSERIAL PRIMARY KEY,               -- 책무기술서_임원_정보ID (PK, 자동증가)

  -- 외래키
  positions_id BIGINT NOT NULL UNIQUE,                   -- 직책ID (FK → positions, UNIQUE for 1:1)
  ledger_order_id VARCHAR(8) NOT NULL,                   -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  user_id VARCHAR(100) NOT NULL,                         -- 사용자ID
  executive_name VARCHAR(100) NOT NULL,                  -- 이름
  employee_no VARCHAR(100) NULL,                         -- 사번
  position_assigned_date DATE NULL,                      -- 현 직책 부여일
  concurrent_position VARCHAR(500) NULL,                 -- 겸직사항
  acting_officer_info VARCHAR(2000) NULL,                -- 직무대행자 내용
  remarks VARCHAR(1000) NULL,                            -- 비고

  -- 책무기술서 정보 (추가)
  responsibility_overview VARCHAR(1000) NULL,            -- 책무개요 내용
  responsibility_assigned_date DATE NULL,                -- 책무 배분일자

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',             -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_resp_stmt_execs_positions FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id) ON DELETE RESTRICT,
  CONSTRAINT fk_resp_stmt_execs_ledger_order FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id) ON DELETE RESTRICT,
  CONSTRAINT chk_resp_stmt_execs_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================================================
-- 인덱스 생성
-- =====================================================================================
-- 직책ID 조회용 인덱스 (UNIQUE로 1:1 관계 보장)
CREATE UNIQUE INDEX idx_resp_stmt_execs_positions_id ON rsms.resp_statement_execs(positions_id);

-- 원장차수ID 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_ledger_order_id ON rsms.resp_statement_execs(ledger_order_id);

-- 사용자ID 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_user_id ON rsms.resp_statement_execs(user_id);

-- 이름 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_name ON rsms.resp_statement_execs(executive_name);

-- 사번 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_employee_no ON rsms.resp_statement_execs(employee_no);

-- 사용여부 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_is_active ON rsms.resp_statement_execs(is_active);

-- 직책 부여일 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_assigned_date ON rsms.resp_statement_execs(position_assigned_date);

-- 책무 배분일자 조회용 인덱스
CREATE INDEX idx_resp_stmt_execs_resp_assigned_date ON rsms.resp_statement_execs(responsibility_assigned_date);

-- 복합 인덱스: 원장차수 + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_resp_stmt_execs_ledger_active ON rsms.resp_statement_execs(ledger_order_id, is_active);

-- 복합 인덱스: 사용자ID + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_resp_stmt_execs_user_active ON rsms.resp_statement_execs(user_id, is_active);

-- =====================================================================================
-- 코멘트 추가
-- =====================================================================================
-- 테이블 코멘트
COMMENT ON TABLE rsms.resp_statement_execs IS '직책에 대한 책무기술서 임원정보를 관리하는 테이블 (positions와 1:1 관계)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.resp_statement_execs.resp_stmt_exec_id IS '책무기술서_임원_정보ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.resp_statement_execs.positions_id IS '직책ID (FK → positions, UNIQUE for 1:1 relationship)';
COMMENT ON COLUMN rsms.resp_statement_execs.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.resp_statement_execs.user_id IS '사용자ID';
COMMENT ON COLUMN rsms.resp_statement_execs.executive_name IS '이름';
COMMENT ON COLUMN rsms.resp_statement_execs.employee_no IS '사번';
COMMENT ON COLUMN rsms.resp_statement_execs.position_assigned_date IS '현 직책 부여일';
COMMENT ON COLUMN rsms.resp_statement_execs.concurrent_position IS '겸직사항';
COMMENT ON COLUMN rsms.resp_statement_execs.acting_officer_info IS '직무대행자 내용';
COMMENT ON COLUMN rsms.resp_statement_execs.remarks IS '비고';
COMMENT ON COLUMN rsms.resp_statement_execs.responsibility_overview IS '책무개요 내용';
COMMENT ON COLUMN rsms.resp_statement_execs.responsibility_assigned_date IS '책무 배분일자';
COMMENT ON COLUMN rsms.resp_statement_execs.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.resp_statement_execs.created_at IS '생성일시';
COMMENT ON COLUMN rsms.resp_statement_execs.created_by IS '생성자';
COMMENT ON COLUMN rsms.resp_statement_execs.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.resp_statement_execs.updated_by IS '수정자';

-- =====================================================================================
-- 트리거 생성 (updated_at 자동 갱신)
-- =====================================================================================
CREATE TRIGGER trigger_resp_stmt_execs_updated_at
  BEFORE UPDATE ON rsms.resp_statement_execs
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- positions 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.resp_statement_execs (
  positions_id,
  ledger_order_id,
  user_id,
  executive_name,
  employee_no,
  position_assigned_date,
  concurrent_position,
  acting_officer_info,
  remarks,
  responsibility_overview,
  responsibility_assigned_date,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 샘플 데이터 1: CEO
  (
    1,
    '20240101',
    'user001',
    '홍길동',
    'EMP001',
    '2024-01-01',
    NULL,
    NULL,
    'CEO 직책',
    '전사 리스크 관리 및 내부통제 체계 구축과 운영에 대한 총괄 책임',
    '2024-01-01',
    'Y',
    'system',
    'system'
  ),
  -- 샘플 데이터 2: CFO (겸직 있음)
  (
    2,
    '20240101',
    'user002',
    '김영희',
    'EMP002',
    '2024-01-15',
    '재무본부장 겸직',
    NULL,
    'CFO 직책',
    '재무 관련 리스크 관리 및 재무 내부통제 체계 운영 책임',
    '2024-01-15',
    'Y',
    'system',
    'system'
  ),
  -- 샘플 데이터 3: CRO (직무대행자 지정)
  (
    3,
    '20240101',
    'user003',
    '박철수',
    'EMP003',
    '2024-02-01',
    NULL,
    '부재 시 리스크관리부장이 직무 대행',
    'CRO 직책',
    '전사 리스크 관리 체계 수립 및 운영, 리스크 모니터링 총괄',
    '2024-02-01',
    'Y',
    'system',
    'system'
  );
*/

-- =====================================================================================
-- 권한 설정
-- =====================================================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.resp_statement_execs TO rsms_app;
--GRANT USAGE, SELECT ON SEQUENCE rsms.resp_statement_execs_resp_stmt_exec_id_seq TO rsms_app;

-- =====================================================================================
-- 스크립트 완료
-- =====================================================================================
