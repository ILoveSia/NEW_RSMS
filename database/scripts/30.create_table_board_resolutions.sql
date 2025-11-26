-- =====================================================
-- 이사회결의 테이블 생성
-- Table: board_resolutions
-- Description: 원장차수별 이사회 결의 정보 관리
-- =====================================================

CREATE TABLE IF NOT EXISTS rsms.board_resolutions (
    -- 기본키 (원장차수ID + "B" + 순번)
    resolution_id VARCHAR(13) PRIMARY KEY,
    -- 예: 20250001B0001 (원장차수 20250001 + "B" + 순번 0001)

    -- 외래키 (원장차수)
    ledger_order_id VARCHAR(8) NOT NULL,

    -- 회차 (원장차수별 자동 증가)
    -- 20250001이 처음이면 1, 계속 증가
    -- 20250002가 시작되면 다시 1로 초기화
    meeting_number INT NOT NULL,

    -- 이사회 결의명
    resolution_name VARCHAR(200) NOT NULL,

    -- 요약정보
    summary TEXT,

    -- 내용
    content TEXT,

    -- 공통 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),

    -- 외래키 제약조건
    CONSTRAINT fk_board_resolutions_ledger_order
        FOREIGN KEY (ledger_order_id)
        REFERENCES ledger_order(ledger_order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- 유니크 제약조건 (원장차수별 회차 중복 방지)
    CONSTRAINT uk_board_resolutions_ledger_meeting
        UNIQUE (ledger_order_id, meeting_number)
);

-- =====================================================
-- 인덱스 생성
-- =====================================================

-- 원장차수별 조회 성능 향상
CREATE INDEX idx_board_resolutions_ledger_order
    ON rsms.board_resolutions(ledger_order_id);

-- 회차별 조회 성능 향상
CREATE INDEX idx_board_resolutions_meeting_number
    ON rsms.board_resolutions(meeting_number);

-- 결의명 검색 성능 향상
CREATE INDEX idx_board_resolutions_name
    ON rsms.board_resolutions(resolution_name);

-- 생성일자별 조회 성능 향상
CREATE INDEX idx_board_resolutions_created_at
    ON rsms.board_resolutions(created_at);

-- =====================================================
-- 테이블 코멘트
-- =====================================================

COMMENT ON TABLE rsms.board_resolutions IS '이사회결의 정보 테이블 - 원장차수별 이사회 결의 관리';

COMMENT ON COLUMN rsms.board_resolutions.resolution_id IS '이사회결의ID (PK) - 원장차수ID(8자리) + "B" + 순번(4자리)';
COMMENT ON COLUMN rsms.board_resolutions.ledger_order_id IS '원장차수ID (FK) - ledger_order 테이블 참조';
COMMENT ON COLUMN rsms.board_resolutions.meeting_number IS '회차 - 원장차수별 자동 증가 (새 원장차수 시작 시 1로 초기화)';
COMMENT ON COLUMN rsms.board_resolutions.resolution_name IS '이사회 결의명';
COMMENT ON COLUMN rsms.board_resolutions.summary IS '요약정보';
COMMENT ON COLUMN rsms.board_resolutions.content IS '내용';
COMMENT ON COLUMN rsms.board_resolutions.created_at IS '생성일시';
COMMENT ON COLUMN rsms.board_resolutions.created_by IS '생성자';
COMMENT ON COLUMN rsms.board_resolutions.updated_at IS '수정일시';
COMMENT ON COLUMN rsms.board_resolutions.updated_by IS '수정자';

-- =====================================================
-- 샘플 데이터 (선택사항)
-- =====================================================

-- 원장차수 20250001의 첫 번째 이사회 결의
INSERT INTO rsms.board_resolutions (
    resolution_id,
    ledger_order_id,
    meeting_number,
    resolution_name,
    summary,
    content,
    created_by
) VALUES (
    '20250001B0001',
    '20250001',
    1,
    '2025년 1분기 경영계획 승인의 건',
    '2025년 1분기 경영계획 및 예산 승인',
    '2025년 1분기 경영계획 및 예산안을 심의하여 원안대로 승인함. 주요 내용은 매출목표 달성을 위한 신규사업 추진 및 조직개편 등을 포함함.',
    'admin'
);

-- 원장차수 20250001의 두 번째 이사회 결의
INSERT INTO rsms.board_resolutions (
    resolution_id,
    ledger_order_id,
    meeting_number,
    resolution_name,
    summary,
    content,
    created_by
) VALUES (
    '20250001B0002',
    '20250001',
    2,
    '임원 인사 승인의 건',
    '신규 임원 선임 및 기존 임원 보직 변경',
    '신규 임원 2명 선임 및 기존 임원 3명의 보직 변경을 승인함. 선임된 임원은 CFO 및 CTO이며, 보직 변경은 사업부문 재편에 따른 조치임.',
    'admin'
);

-- 원장차수 20250002의 첫 번째 이사회 결의 (회차가 다시 1로 시작)
INSERT INTO rsms.board_resolutions (
    resolution_id,
    ledger_order_id,
    meeting_number,
    resolution_name,
    summary,
    content,
    created_by
) VALUES (
    '20250002B0001',
    '20250002',
    1,
    '2025년 2분기 경영계획 승인의 건',
    '2025년 2분기 경영계획 및 예산 승인',
    '2025년 2분기 경영계획 및 예산안을 심의하여 원안대로 승인함.',
    'admin'
);

-- =====================================================
-- 권한 설정
-- =====================================================

-- RSMS 애플리케이션 사용자에게 테이블 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON rsms.board_resolutions TO rsms_app_user;

-- =====================================================
-- 마이그레이션 완료
-- =====================================================
