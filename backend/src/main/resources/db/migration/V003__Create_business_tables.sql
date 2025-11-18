-- =====================================================================================
-- V003: 업무 테이블 생성 (원장차수, 직책, 겸직, 회의체, 책무구조도)
-- =====================================================================================
-- 설명:
--   - ledger_order: 원장차수 관리 테이블
--   - positions: 직책 테이블
--   - positions_details: 직책 상세정보 테이블
--   - position_concurrents: 직책겸직 테이블
--   - committees: 회의체 테이블
--   - committee_details: 회의체 상세 테이블
--   - responsibilities: 책무 테이블
--   - responsibility_details: 책무세부 테이블
--   - management_obligations: 관리의무 테이블
--   - resp_statement_execs: 책무기술서_임원_정보 테이블
-- 작성일: 2025-10-28
-- Flyway 마이그레이션: V003
-- 참조: database/scripts/04-13
-- =====================================================================================



-- =====================================================
-- 1. 원장차수관리 테이블 (ledger_order)
-- =====================================================
-- 설명: 원장차수 정보를 관리하는 테이블
-- 참고:
--   - ledger_order_id는 년도(4자리) + 순번(4자리) 형식 (예: 20250001, 20250002)
--   - 년도별로 순번은 0001부터 시작하여 자동 증가
--   - 생성 시 기본 상태는 '신규'
--   - 상태값은 common_code_details의 'LDGR_ORDR_ST' 그룹에서 관리
-- =====================================================

-- 년도별 순번 생성을 위한 시퀀스 함수
CREATE OR REPLACE FUNCTION rsms.generate_ledger_order_id()
RETURNS VARCHAR(8) AS $$
DECLARE
  current_year VARCHAR(4);
  next_seq VARCHAR(4);
  new_id VARCHAR(8);
  max_id VARCHAR(8);
BEGIN
  -- 현재 년도 추출
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- 해당 년도의 최대 ID 조회
  SELECT MAX(ledger_order_id) INTO max_id
  FROM rsms.ledger_order
  WHERE SUBSTRING(ledger_order_id, 1, 4) = current_year;

  -- 순번 계산
  IF max_id IS NULL THEN
    -- 해당 년도의 첫 번째 ID
    next_seq := '0001';
  ELSE
    -- 기존 ID의 순번 추출 후 1 증가
    next_seq := LPAD((SUBSTRING(max_id, 5, 4)::INTEGER + 1)::TEXT, 4, '0');
  END IF;

  -- 새 ID 생성
  new_id := current_year || next_seq;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 테이블 생성
CREATE TABLE rsms.ledger_order (
  -- 기본키
  ledger_order_id VARCHAR(8) PRIMARY KEY DEFAULT rsms.generate_ledger_order_id(), -- 원장차수ID (년도4자리+순번4자리, 자동생성)

  -- 기본 정보
  ledger_order_title VARCHAR(200) NULL,                -- 원장 제목
  ledger_order_status VARCHAR(10) NOT NULL DEFAULT 'NEW', -- 원장상태 (NEW: 신규, PROG: 진행중, CLSD: 종료)
  ledger_order_remarks VARCHAR(500) NULL,              -- 비고

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 제약조건
  CONSTRAINT chk_ledger_order_status CHECK (ledger_order_status IN ('NEW', 'PROG', 'CLSD')),
  CONSTRAINT chk_ledger_order_id_format CHECK (
    ledger_order_id ~ '^[0-9]{8}$' AND LENGTH(ledger_order_id) = 8
  )
);

-- 인덱스 생성
CREATE INDEX idx_ledger_order_status ON rsms.ledger_order(ledger_order_status);
CREATE INDEX idx_ledger_order_title ON rsms.ledger_order(ledger_order_title);

-- 코멘트 추가
COMMENT ON TABLE rsms.ledger_order IS '원장차수관리 테이블 - 원장차수 정보를 관리';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_id IS '원장차수ID (년도4자리+순번4자리, 예: 20250001, 자동생성)';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_title IS '원장 제목';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_status IS '원장상태 (NEW: 신규, PROG: 진행중, CLSD: 종료, common_code_details의 LDGR_ORDR_ST 그룹 참조)';
COMMENT ON COLUMN rsms.ledger_order.ledger_order_remarks IS '비고';
COMMENT ON COLUMN rsms.ledger_order.created_by IS '생성자';
COMMENT ON COLUMN rsms.ledger_order.created_at IS '생성일시';
COMMENT ON COLUMN rsms.ledger_order.updated_by IS '수정자';
COMMENT ON COLUMN rsms.ledger_order.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_ledger_order_updated_at
  BEFORE UPDATE ON rsms.ledger_order
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 2. 직책 테이블 (positions)
-- =====================================================
-- 설명: 원장차수별 직책 정보를 관리하는 테이블
-- 참고:
--   - 원장차수별로 직책을 관리
--   - positions_cd는 common_code_details에서 group_code='RSBT_RSOF_DVCD'로 관리
--   - 같은 원장차수에서 같은 직책이 본부별로 여러 개 존재 가능
--   - UNIQUE 제약조건으로 (원장차수 + 직책코드 + 본부코드) 조합의 유일성 보장
-- =====================================================

CREATE TABLE rsms.positions (
  -- 기본키 (대리키)
  positions_id BIGSERIAL PRIMARY KEY,                  -- 직책ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  positions_cd VARCHAR(20) NOT NULL,                   -- 직책코드 (common_code_details의 RSBT_RSOF_DVCD 그룹 참조)
  positions_name VARCHAR(200) NOT NULL,                -- 직책명
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (common_code_details의 DPRM_CD 그룹 참조)
  hq_name VARCHAR(200) NOT NULL,                       -- 본부명
  executive_emp_no VARCHAR(100) NULL,                  -- 임원사번

  -- 만료 정보
  expiration_date DATE NOT NULL DEFAULT '9999-12-31',  -- 만료일 (기본값: 9999-12-31)

  -- 상태 정보
  positions_status VARCHAR(20) NULL,                   -- 상태 (나중에 사용 예정)
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')
  is_concurrent VARCHAR(1) NOT NULL DEFAULT 'N',       -- 겸직여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_positions_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 원장차수 + 직책코드 + 본부코드 조합은 유일)
  CONSTRAINT uk_positions_ledger_position_hq
    UNIQUE (ledger_order_id, positions_cd, hq_code),

  -- 유일성 제약조건 (position_concurrents 외래키 참조용)
  CONSTRAINT uk_positions_ledger_position
    UNIQUE (ledger_order_id, positions_cd),

  -- 체크 제약조건
  CONSTRAINT chk_positions_is_active CHECK (is_active IN ('Y', 'N')),
  CONSTRAINT chk_positions_is_concurrent CHECK (is_concurrent IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_positions_ledger_order_id ON rsms.positions(ledger_order_id);
CREATE INDEX idx_positions_positions_cd ON rsms.positions(positions_cd);
CREATE INDEX idx_positions_positions_name ON rsms.positions(positions_name);
CREATE INDEX idx_positions_hq_code ON rsms.positions(hq_code);
CREATE INDEX idx_positions_executive_emp_no ON rsms.positions(executive_emp_no);
CREATE INDEX idx_positions_expiration_date ON rsms.positions(expiration_date);
CREATE INDEX idx_positions_positions_status ON rsms.positions(positions_status);
CREATE INDEX idx_positions_is_active ON rsms.positions(is_active);
CREATE INDEX idx_positions_is_concurrent ON rsms.positions(is_concurrent);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_positions_ledger_positions ON rsms.positions(ledger_order_id, positions_cd);
CREATE INDEX idx_positions_ledger_hq ON rsms.positions(ledger_order_id, hq_code);
CREATE INDEX idx_positions_hq_positions ON rsms.positions(hq_code, positions_cd);
CREATE INDEX idx_positions_active_concurrent ON rsms.positions(is_active, is_concurrent);

-- 코멘트 추가
COMMENT ON TABLE rsms.positions IS '직책 테이블 - 원장차수별 직책 정보를 관리';
COMMENT ON COLUMN rsms.positions.positions_id IS '직책ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.positions.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.positions.positions_cd IS '직책코드 (common_code_details의 RSBT_RSOF_DVCD 그룹 참조)';
COMMENT ON COLUMN rsms.positions.positions_name IS '직책명';
COMMENT ON COLUMN rsms.positions.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조)';
COMMENT ON COLUMN rsms.positions.hq_name IS '본부명';
COMMENT ON COLUMN rsms.positions.executive_emp_no IS '임원사번';
COMMENT ON COLUMN rsms.positions.expiration_date IS '만료일 (기본값: 9999-12-31)';
COMMENT ON COLUMN rsms.positions.positions_status IS '상태 (나중에 사용 예정)';
COMMENT ON COLUMN rsms.positions.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.positions.is_concurrent IS '겸직여부 (Y: 겸직, N: 전임)';
COMMENT ON COLUMN rsms.positions.created_by IS '생성자';
COMMENT ON COLUMN rsms.positions.created_at IS '생성일시';
COMMENT ON COLUMN rsms.positions.updated_by IS '수정자';
COMMENT ON COLUMN rsms.positions.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON rsms.positions
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 3. 직책 상세정보 테이블 (positions_details)
-- =====================================================
-- 설명: 직책별 조직(부서/영업점) 상세 정보를 관리하는 테이블
-- 참고:
--   - positions 테이블과 1:N 관계
--   - 하나의 직책(본부)에 여러 조직(부서/영업점)이 소속됨
--   - 본부코드는 positions의 hq_code와 동일
--   - 조직코드는 organizations 테이블의 org_code 참조
-- =====================================================

CREATE TABLE rsms.positions_details (
  -- 기본키 (대리키)
  positions_details_id BIGSERIAL PRIMARY KEY,          -- 직책상세ID (PK, 자동증가)

  -- 외래키
  positions_id BIGINT NOT NULL,                        -- 직책ID (FK → positions)

  -- 기본 정보
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (positions의 hq_code와 동일)
  org_code VARCHAR(20) NOT NULL,                       -- 조직코드 (FK → organizations)

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_positions_details_positions
    FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- 외래키 제약조건 (org_code → organizations)
  CONSTRAINT fk_positions_details_org_code
    FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (비즈니스 로직: 직책 + 조직코드 조합은 유일)
  CONSTRAINT uk_positions_details_position_org
    UNIQUE (positions_id, org_code)
);

-- 인덱스 생성
CREATE INDEX idx_positions_details_positions_id ON rsms.positions_details(positions_id);
CREATE INDEX idx_positions_details_hq_code ON rsms.positions_details(hq_code);
CREATE INDEX idx_positions_details_org_code ON rsms.positions_details(org_code);
CREATE INDEX idx_positions_details_hq_org ON rsms.positions_details(hq_code, org_code);

-- 코멘트 추가
COMMENT ON TABLE rsms.positions_details IS '직책 상세정보 테이블 - 직책별 조직(부서/영업점) 상세 정보를 관리';
COMMENT ON COLUMN rsms.positions_details.positions_details_id IS '직책상세ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.positions_details.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.positions_details.hq_code IS '본부코드 (positions의 hq_code와 동일, common_code_details의 DPRM_CD 그룹 참조)';
COMMENT ON COLUMN rsms.positions_details.org_code IS '조직코드 (FK → organizations.org_code)';
COMMENT ON COLUMN rsms.positions_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.positions_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.positions_details.updated_by IS '수정자';
COMMENT ON COLUMN rsms.positions_details.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_positions_details_updated_at
  BEFORE UPDATE ON rsms.positions_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 4. 직책겸직 테이블 (position_concurrents)
-- =====================================================
-- 설명: 겸직 직책 정보를 관리하는 테이블
-- 참고:
--   - 겸직 그룹별로 여러 직책이 묶임
--   - 대표직책(is_representative='Y') 지정 가능
--   - 겸직 그룹코드는 common_code_details 참조
-- =====================================================

CREATE TABLE rsms.position_concurrents (
  -- 기본키 (대리키)
  position_concurrent_id BIGSERIAL PRIMARY KEY,        -- 직책겸직ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)
  positions_cd VARCHAR(20) NOT NULL,                   -- 직책코드 (common_code_details의 PSTN_CD 그룹 참조)

  -- 기본 정보
  concurrent_group_cd VARCHAR(20) NOT NULL,            -- 겸직그룹코드 (common_code_details의 CCRN_GRP_CD 그룹 참조)
  positions_name VARCHAR(200) NULL,                    -- 직책명 (참고용, common_code_details에서 가져올 수도 있음)
  is_representative VARCHAR(1) NOT NULL DEFAULT 'N',   -- 대표직책 여부 ('Y', 'N')
  hq_code VARCHAR(20) NOT NULL,                        -- 본부코드 (common_code_details의 DPRM_CD 그룹 참조)
  hq_name VARCHAR(200) NOT NULL,                       -- 본부명

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_position_concurrents_ledger_order
    FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- CHECK 제약조건
  CONSTRAINT chk_position_concurrents_is_representative CHECK (is_representative IN ('Y', 'N')),
  CONSTRAINT chk_position_concurrents_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_position_concurrents_ledger_order_id ON rsms.position_concurrents(ledger_order_id);
CREATE INDEX idx_position_concurrents_positions_cd ON rsms.position_concurrents(positions_cd);
CREATE INDEX idx_position_concurrents_group_cd ON rsms.position_concurrents(concurrent_group_cd);
CREATE INDEX idx_position_concurrents_hq_code ON rsms.position_concurrents(hq_code);
CREATE INDEX idx_position_concurrents_is_active ON rsms.position_concurrents(is_active);
CREATE INDEX idx_position_concurrents_ledger_active ON rsms.position_concurrents(ledger_order_id, is_active);
CREATE INDEX idx_position_concurrents_group_representative ON rsms.position_concurrents(concurrent_group_cd, is_representative);

-- 코멘트 추가
COMMENT ON TABLE rsms.position_concurrents IS '직책겸직 테이블 - 겸직 직책 정보를 관리';
COMMENT ON COLUMN rsms.position_concurrents.position_concurrent_id IS '직책겸직ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.position_concurrents.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.position_concurrents.positions_cd IS '직책코드 (common_code_details의 PSTN_CD 그룹 참조)';
COMMENT ON COLUMN rsms.position_concurrents.concurrent_group_cd IS '겸직그룹코드 (common_code_details의 CCRN_GRP_CD 그룹 참조)';
COMMENT ON COLUMN rsms.position_concurrents.positions_name IS '직책명 (참고용)';
COMMENT ON COLUMN rsms.position_concurrents.is_representative IS '대표직책 여부 (Y: 대표직책, N: 일반직책)';
COMMENT ON COLUMN rsms.position_concurrents.hq_code IS '본부코드 (common_code_details의 DPRM_CD 그룹 참조)';
COMMENT ON COLUMN rsms.position_concurrents.hq_name IS '본부명';
COMMENT ON COLUMN rsms.position_concurrents.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.position_concurrents.created_by IS '생성자';
COMMENT ON COLUMN rsms.position_concurrents.created_at IS '생성일시';
COMMENT ON COLUMN rsms.position_concurrents.updated_by IS '수정자';
COMMENT ON COLUMN rsms.position_concurrents.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_position_concurrents_updated_at
  BEFORE UPDATE ON rsms.position_concurrents
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 5. 회의체 테이블 (committees)
-- =====================================================
-- 설명: 회의체 정보를 관리하는 테이블
-- 참고:
--   - 원장차수별로 관리
--   - 회의체코드는 common_code_details의 CMTE_CD 그룹 참조
-- =====================================================

CREATE TABLE rsms.committees (
  -- 기본키 (대리키)
  committees_id BIGSERIAL PRIMARY KEY,                 -- 회의체ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                 -- 원장차수ID (FK → ledger_order)

  -- 기본 정보
  committees_title VARCHAR(100) NOT NULL,              -- 회의체명
  committee_frequency VARCHAR(20) NULL,                -- 개최주기코드 (common_code_details의 CFRN_CYCL_DVCD 그룹 참조)
  resolution_matters VARCHAR(1000) NULL,               -- 주요심의 의결사항

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',           -- 사용여부 ('Y', 'N')

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 체크 제약조건
  CONSTRAINT chk_committees_is_active CHECK (is_active IN ('Y', 'N')),

  -- 외래키 제약조건
  CONSTRAINT fk_committees_ledger_order FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_committees_ledger_order_id ON rsms.committees(ledger_order_id);
CREATE INDEX idx_committees_title ON rsms.committees(committees_title);
CREATE INDEX idx_committees_frequency ON rsms.committees(committee_frequency);
CREATE INDEX idx_committees_is_active ON rsms.committees(is_active);

-- 복합 인덱스 (자주 조회되는 조합)
CREATE INDEX idx_committees_ledger_active ON rsms.committees(ledger_order_id, is_active);
CREATE INDEX idx_committees_active_frequency ON rsms.committees(is_active, committee_frequency);

-- 코멘트 추가
COMMENT ON TABLE rsms.committees IS '회의체 테이블 - 회의체 정보를 관리';
COMMENT ON COLUMN rsms.committees.committees_id IS '회의체ID (PK, 대리키, 자동증가)';
COMMENT ON COLUMN rsms.committees.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.committees.committees_title IS '회의체명';
COMMENT ON COLUMN rsms.committees.committee_frequency IS '개최주기코드 (common_code_details의 CFRN_CYCL_DVCD 그룹 참조, 예: 월1회, 분기1회, 수시)';
COMMENT ON COLUMN rsms.committees.resolution_matters IS '주요심의 의결사항';
COMMENT ON COLUMN rsms.committees.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.committees.created_by IS '생성자';
COMMENT ON COLUMN rsms.committees.created_at IS '생성일시';
COMMENT ON COLUMN rsms.committees.updated_by IS '수정자';
COMMENT ON COLUMN rsms.committees.updated_at IS '수정일시';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_committees_updated_at
  BEFORE UPDATE ON rsms.committees
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 6. 회의체 상세 테이블 (committee_details)
-- =====================================================
-- 설명: 회의체별 위원장 및 위원 정보를 관리하는 테이블
-- 참고:
--   - committees 테이블과 1:N 관계
--   - 위원구분: CHAIR(위원장), MEMBER(위원)
-- =====================================================

CREATE TABLE rsms.committee_details (
  -- 기본키 (대리키)
  committee_details_id BIGSERIAL PRIMARY KEY,          -- 회의체상세ID (PK, 자동증가)

  -- 외래키
  committees_id BIGINT NOT NULL,                       -- 회의체ID (FK → committees)
  positions_id BIGINT NOT NULL,                        -- 직책ID (FK → positions)

  -- 기본 정보
  committees_type VARCHAR(20) NOT NULL,                -- 위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조)

  -- 감사 정보
  created_by VARCHAR(100) NOT NULL,                    -- 생성자
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
  updated_by VARCHAR(100) NOT NULL,                    -- 수정자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일시

  -- 외래키 제약조건
  CONSTRAINT fk_committee_details_committees
    FOREIGN KEY (committees_id)
    REFERENCES rsms.committees(committees_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_committee_details_positions
    FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- 유일성 제약조건 (같은 회의체에 같은 멤버 중복 불가)
  CONSTRAINT uk_committee_details_committees_positions
    UNIQUE (committees_id, positions_id)
);

-- 인덱스 생성
CREATE INDEX idx_committee_details_committees_id ON rsms.committee_details(committees_id);
CREATE INDEX idx_committee_details_positions_id ON rsms.committee_details(positions_id);
CREATE INDEX idx_committee_details_type ON rsms.committee_details(committees_type);

-- 코멘트 추가
COMMENT ON TABLE rsms.committee_details IS '회의체 상세 테이블 - 회의체별 위원장 및 위원 정보를 관리';
COMMENT ON COLUMN rsms.committee_details.committee_details_id IS '회의체상세ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.committee_details.committees_id IS '회의체ID (FK → committees)';
COMMENT ON COLUMN rsms.committee_details.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.committee_details.committees_type IS '위원장/위원 구분코드 (common_code_details의 CMITE_DVCD 그룹 참조)';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trg_committee_details_updated_at
  BEFORE UPDATE ON rsms.committee_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 7. 책무 테이블 (responsibilities)
-- =====================================================
-- 설명: 책무 정보를 관리하는 테이블
-- =====================================================

CREATE TABLE rsms.responsibilities (
  -- 기본키 (대리키)
  responsibility_id BIGSERIAL PRIMARY KEY,                -- 책무ID (PK, 자동증가)

  -- 외래키
  ledger_order_id VARCHAR(8) NOT NULL,                    -- 원장차수ID (FK → ledger_order)
  positions_id BIGINT NOT NULL,                           -- 직책ID (FK → positions)

  -- 기본 정보
  responsibility_cat VARCHAR(20) NOT NULL,                -- 책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조)
  responsibility_cd VARCHAR(20) NOT NULL,                 -- 책무코드 (common_code_details의 RSBT_OBLG_CD 그룹 참조)
  responsibility_info VARCHAR(1000) NOT NULL,             -- 책무내용
  responsibility_legal VARCHAR(1000) NOT NULL,            -- 책무관련근거 (직접입력)

  -- 만료 정보
  expiration_date DATE NOT NULL DEFAULT '9999-12-31',     -- 만료일 (기본값: 9999-12-31)

  -- 상태 정보
  responsibility_status VARCHAR(20) NULL,                 -- 상태 (나중에 사용 예정)
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',              -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_responsibilities_ledger_order FOREIGN KEY (ledger_order_id)
    REFERENCES rsms.ledger_order(ledger_order_id) ON DELETE RESTRICT,
  CONSTRAINT fk_responsibilities_positions FOREIGN KEY (positions_id)
    REFERENCES rsms.positions(positions_id) ON DELETE RESTRICT,
  CONSTRAINT chk_responsibilities_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_responsibilities_ledger_order_id ON rsms.responsibilities(ledger_order_id);
CREATE INDEX idx_responsibilities_positions_id ON rsms.responsibilities(positions_id);
CREATE INDEX idx_responsibilities_cat ON rsms.responsibilities(responsibility_cat);
CREATE INDEX idx_responsibilities_cd ON rsms.responsibilities(responsibility_cd);
CREATE INDEX idx_responsibilities_is_active ON rsms.responsibilities(is_active);
CREATE INDEX idx_responsibilities_ledger_active ON rsms.responsibilities(ledger_order_id, is_active);

-- 코멘트 추가
COMMENT ON TABLE rsms.responsibilities IS '책무 정보를 관리하는 테이블';
COMMENT ON COLUMN rsms.responsibilities.responsibility_id IS '책무ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.responsibilities.ledger_order_id IS '원장차수ID (FK → ledger_order)';
COMMENT ON COLUMN rsms.responsibilities.positions_id IS '직책ID (FK → positions)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_cat IS '책무카테고리 (common_code_details의 RSBT_OBLG_CLCD 그룹 참조)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_cd IS '책무코드 (common_code_details의 RSBT_OBLG_CD 그룹 참조)';
COMMENT ON COLUMN rsms.responsibilities.responsibility_info IS '책무내용';
COMMENT ON COLUMN rsms.responsibilities.responsibility_legal IS '책무관련근거 (직접입력)';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trigger_responsibilities_updated_at
  BEFORE UPDATE ON rsms.responsibilities
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 8. 책무세부 테이블 (responsibility_details)
-- =====================================================
-- 설명: 책무세부 정보를 관리하는 테이블
-- =====================================================

CREATE TABLE rsms.responsibility_details (
  -- 기본키 (대리키)
  responsibility_detail_id BIGSERIAL PRIMARY KEY,             -- 책무세부ID (PK, 자동증가)

  -- 외래키
  responsibility_id BIGINT NOT NULL,                          -- 책무ID (FK → responsibilities)

  -- 기본 정보
  responsibility_detail_info VARCHAR(2000) NOT NULL,          -- 책무세부내용

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',                  -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_responsibility_details_responsibility FOREIGN KEY (responsibility_id)
    REFERENCES rsms.responsibilities(responsibility_id) ON DELETE CASCADE,
  CONSTRAINT chk_responsibility_details_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_responsibility_details_responsibility_id ON rsms.responsibility_details(responsibility_id);
CREATE INDEX idx_responsibility_details_is_active ON rsms.responsibility_details(is_active);
CREATE INDEX idx_responsibility_details_resp_active ON rsms.responsibility_details(responsibility_id, is_active);

-- 코멘트 추가
COMMENT ON TABLE rsms.responsibility_details IS '책무세부 정보를 관리하는 테이블 (1:N 관계)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_detail_id IS '책무세부ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_id IS '책무ID (FK → responsibilities)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_detail_info IS '책무세부내용';
COMMENT ON COLUMN rsms.responsibility_details.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.responsibility_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.responsibility_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.responsibility_details.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.responsibility_details.updated_by IS '수정자';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trigger_responsibility_details_updated_at
  BEFORE UPDATE ON rsms.responsibility_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 9. 관리의무 테이블 (management_obligations)
-- =====================================================
-- 설명: 책무세부에 대한 관리의무 정보를 관리하는 테이블 (1:N 관계)
-- =====================================================

CREATE TABLE rsms.management_obligations (
  -- 기본키 (대리키)
  management_obligation_id BIGSERIAL PRIMARY KEY,             -- 관리의무ID (PK, 자동증가)

  -- 외래키
  responsibility_detail_id BIGINT NOT NULL,                   -- 책무세부ID (FK → responsibility_details)

  -- 기본 정보
  obligation_major_cat_cd VARCHAR(20) NOT NULL,               -- 관리의무 대분류 구분코드 (common_code_details 의 MGMT_OBLG_LCCD 그룹 참조)
  obligation_cd VARCHAR(20) NOT NULL,                         -- 관리의무코드 신규생성
  obligation_info VARCHAR(1000) NOT NULL,                     -- 관리의무내용
  org_code VARCHAR(20) NOT NULL,                              -- 조직코드 (organizations 참조)

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',                  -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  created_by VARCHAR(50) NOT NULL,                            -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                            -- 수정자

  -- 제약조건
  CONSTRAINT fk_management_obligations_resp_detail FOREIGN KEY (responsibility_detail_id)
    REFERENCES rsms.responsibility_details(responsibility_detail_id) ON DELETE CASCADE,

  CONSTRAINT fk_management_obligations_org_code FOREIGN KEY (org_code)
    REFERENCES rsms.organizations(org_code) ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT chk_management_obligations_is_active CHECK (is_active IN ('Y', 'N'))
);

-- 인덱스 생성
CREATE INDEX idx_mgmt_obligations_resp_detail_id ON rsms.management_obligations(responsibility_detail_id);
CREATE INDEX idx_mgmt_obligations_major_cat ON rsms.management_obligations(obligation_major_cat_cd);
CREATE INDEX idx_mgmt_obligations_org_code ON rsms.management_obligations(org_code);

-- 코멘트 추가
COMMENT ON TABLE rsms.management_obligations IS '책무세부에 대한 관리의무 정보를 관리하는 테이블 (1:N 관계)';
COMMENT ON COLUMN rsms.management_obligations.management_obligation_id IS '관리의무ID (PK, 자동증가)';
COMMENT ON COLUMN rsms.management_obligations.responsibility_detail_id IS '책무세부ID (FK → responsibility_details)';

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trigger_management_obligations_updated_at
  BEFORE UPDATE ON rsms.management_obligations
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();



-- =====================================================
-- 10. 책무기술서_임원_정보 테이블 (resp_statement_execs)
-- =====================================================
-- 설명: 직책에 대한 책무기술서 임원정보를 관리하는 테이블 (positions와 1:1 관계)
-- =====================================================

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

-- 인덱스 생성
CREATE UNIQUE INDEX idx_resp_stmt_execs_positions_id ON rsms.resp_statement_execs(positions_id);
CREATE INDEX idx_resp_stmt_execs_ledger_order_id ON rsms.resp_statement_execs(ledger_order_id);
CREATE INDEX idx_resp_stmt_execs_user_id ON rsms.resp_statement_execs(user_id);
CREATE INDEX idx_resp_stmt_execs_name ON rsms.resp_statement_execs(executive_name);
CREATE INDEX idx_resp_stmt_execs_employee_no ON rsms.resp_statement_execs(employee_no);
CREATE INDEX idx_resp_stmt_execs_is_active ON rsms.resp_statement_execs(is_active);
CREATE INDEX idx_resp_stmt_execs_ledger_active ON rsms.resp_statement_execs(ledger_order_id, is_active);

-- 코멘트 추가
COMMENT ON TABLE rsms.resp_statement_execs IS '직책에 대한 책무기술서 임원정보를 관리하는 테이블 (positions와 1:1 관계)';
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

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER trigger_resp_stmt_execs_updated_at
  BEFORE UPDATE ON rsms.resp_statement_execs
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================================================
-- V003 스크립트 완료
-- =====================================================================================
