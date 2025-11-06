-- =====================================================================================
-- 07. responsibility_details 테이블 생성 (책무세부 테이블)
-- =====================================================================================
-- 설명: 책무세부 정보를 관리하는 테이블
-- 작성일: 2025-09-24
-- 수정일: 2025-01-05 - PK를 자동증가에서 업무 코드로 변경
-- =====================================================================================
-- 변경사항:
--   - PK: responsibility_detail_id (BIGSERIAL) → responsibility_detail_cd (VARCHAR, 업무 코드)
--   - 코드 생성 규칙: 책무코드 뒷 9자리 + "D" + 순번(4자리)
--   - 예시: "RM0001D0001" (RM0001책무 + D + 0001순번)
--   - FK: responsibility_id (BIGINT) → responsibility_cd (VARCHAR)
-- =====================================================================================

-- 기존 테이블이 존재하면 삭제 (개발 환경에서만 사용, 운영 환경에서는 주석 처리 필요)
DROP TABLE IF EXISTS rsms.responsibility_details CASCADE;

-- responsibility_details 테이블 생성
CREATE TABLE rsms.responsibility_details (
  -- 기본키 (업무 코드)
  -- 코드 생성 규칙: 책무코드 뒷 9자리 + "D" + 순번(4자리)
  -- 예시: "RM0001D0001" = "RM0001"(책무코드 suffix) + "D" + "0001"(순번)
  responsibility_detail_cd VARCHAR(30) PRIMARY KEY,          -- 책무세부코드 (PK, 업무 코드)

  -- 외래키 (책무코드 참조)
  responsibility_cd VARCHAR(20) NOT NULL,                    -- 책무코드 (FK → responsibilities)

  -- 기본 정보
  responsibility_detail_info VARCHAR(2000) NOT NULL,         -- 책무세부내용

  -- 상태 정보
  is_active VARCHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용여부 ('Y', 'N')

  -- 공통 컬럼 (BaseEntity)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- 생성일시
  created_by VARCHAR(50) NOT NULL,                           -- 생성자
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- 수정일시
  updated_by VARCHAR(50) NOT NULL,                           -- 수정자

  -- 제약조건
  CONSTRAINT fk_responsibility_details_responsibility FOREIGN KEY (responsibility_cd)
    REFERENCES rsms.responsibilities(responsibility_cd) ON DELETE CASCADE,
  CONSTRAINT chk_responsibility_details_is_active CHECK (is_active IN ('Y', 'N'))
);

-- =====================================================================================
-- 인덱스 생성
-- =====================================================================================
-- 책무코드 조회용 인덱스 (가장 자주 사용)
CREATE INDEX idx_responsibility_details_responsibility_cd ON rsms.responsibility_details(responsibility_cd);

-- 사용여부 조회용 인덱스
CREATE INDEX idx_responsibility_details_is_active ON rsms.responsibility_details(is_active);

-- 복합 인덱스: 책무코드 + 사용여부 (자주 사용되는 조합)
CREATE INDEX idx_responsibility_details_resp_active ON rsms.responsibility_details(responsibility_cd, is_active);

-- =====================================================================================
-- 코멘트 추가
-- =====================================================================================
-- 테이블 코멘트
COMMENT ON TABLE rsms.responsibility_details IS '책무세부 정보를 관리하는 테이블 (1:N 관계, 코드 체계: 책무코드suffix+D+순번)';

-- 컬럼 코멘트
COMMENT ON COLUMN rsms.responsibility_details.responsibility_detail_cd IS '책무세부코드 (PK, 업무코드 - 형식: 책무코드 뒷 9자리 + D + 순번4자리, 예: RM0001D0001)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_cd IS '책무코드 (FK → responsibilities.responsibility_cd)';
COMMENT ON COLUMN rsms.responsibility_details.responsibility_detail_info IS '책무세부내용';
COMMENT ON COLUMN rsms.responsibility_details.is_active IS '사용여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN rsms.responsibility_details.created_at IS '생성일시';
COMMENT ON COLUMN rsms.responsibility_details.created_by IS '생성자';
COMMENT ON COLUMN rsms.responsibility_details.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.responsibility_details.updated_by IS '수정자';

-- =====================================================================================
-- 트리거 생성 (updated_at 자동 갱신)
-- =====================================================================================
CREATE TRIGGER trigger_responsibility_details_updated_at
  BEFORE UPDATE ON rsms.responsibility_details
  FOR EACH ROW
  EXECUTE FUNCTION rsms.update_updated_at_column();

-- =====================================================================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- =====================================================================================
-- 운영 환경에서는 이 섹션을 주석 처리하거나 제거하세요
/*
-- responsibilities 테이블에 샘플 데이터가 있다고 가정
INSERT INTO rsms.responsibility_details (
  responsibility_detail_cd,
  responsibility_cd,
  responsibility_detail_info,
  is_active,
  created_by,
  updated_by
) VALUES
  -- 리스크 관리 책무("20250001RM0001")의 세부 내용들
  ('RM0001D0001', '20250001RM0001', '리스크 식별: 잠재적 리스크 요인을 파악하고 문서화', 'Y', 'system', 'system'),
  ('RM0001D0002', '20250001RM0001', '리스크 평가: 식별된 리스크의 영향도와 발생 가능성 평가', 'Y', 'system', 'system'),
  ('RM0001D0003', '20250001RM0001', '리스크 모니터링: 주요 리스크 지표를 지속적으로 모니터링', 'Y', 'system', 'system'),

  -- 내부통제 책무("20250001IC0001")의 세부 내용들
  ('IC0001D0001', '20250001IC0001', '통제 활동 설계: 효과적인 내부통제 프로세스 설계 및 구현', 'Y', 'system', 'system'),
  ('IC0001D0002', '20250001IC0001', '통제 실행: 설계된 통제 활동을 일상 업무에 적용', 'Y', 'system', 'system'),
  ('IC0001D0003', '20250001IC0001', '통제 모니터링: 통제 활동의 효과성을 정기적으로 점검', 'Y', 'system', 'system'),

  -- 준법 감시 책무("20250001CP0001")의 세부 내용들
  ('CP0001D0001', '20250001CP0001', '법규 모니터링: 관련 법규 및 규정의 변경사항 모니터링', 'Y', 'system', 'system'),
  ('CP0001D0002', '20250001CP0001', '준법 점검: 정기적인 준법 점검 활동 수행', 'Y', 'system', 'system'),
  ('CP0001D0003', '20250001CP0001', '준법 교육: 임직원 대상 준법 교육 실시', 'Y', 'system', 'system');
*/

-- =====================================================================================
-- 책무세부코드 생성 예시 및 설명
-- =====================================================================================
-- Backend에서 코드를 자동 생성하는 로직:
--
-- 1. 부모 책무코드에서 suffix 추출:
--    String respSuffix = responsibilityCode.substring(8); // "20250001RM0001" → "RM0001"
--
-- 2. 최대 순번 조회 쿼리:
--    SELECT MAX(SUBSTRING(responsibility_detail_cd, LENGTH(respSuffix) + 2, 4)::INTEGER)
--    FROM rsms.responsibility_details
--    WHERE responsibility_cd = '20250001RM0001';
--
-- 3. 코드 생성 로직:
--    String nextSeq = String.format("%04d", maxSeq + 1);
--    String code = respSuffix + "D" + nextSeq;
--    // 예: "RM0001" + "D" + "0001" = "RM0001D0001"
--
-- 4. 코드 형식 검증:
--    - 길이: 10-30자
--    - 패턴: 책무코드suffix (2-20자) + "D" + 순번(4자리)
--    - 예: "RM0001D0001", "RISK_MGT0001D0001"
-- =====================================================================================

-- =====================================================================================
-- 권한 설정
-- =====================================================================================
-- rsms_app 역할에 테이블 권한 부여
--GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.responsibility_details TO rsms_app;

-- =====================================================================================
-- 스크립트 완료
-- =====================================================================================
