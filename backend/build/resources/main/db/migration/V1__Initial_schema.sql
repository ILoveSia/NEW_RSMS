-- Initial Schema for RSMS Backend
-- Spring Session 테이블 (세션 관리용)
CREATE TABLE IF NOT EXISTS spring_session (
    primary_id char(36) NOT NULL,
    session_id char(36) NOT NULL,
    creation_time bigint NOT NULL,
    last_access_time bigint NOT NULL,
    max_inactive_interval integer NOT NULL,
    expiry_time bigint NOT NULL,
    principal_name varchar(100),
    CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX spring_session_ix1 ON spring_session (session_id);
CREATE INDEX spring_session_ix2 ON spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session (principal_name);

CREATE TABLE IF NOT EXISTS spring_session_attributes (
    session_primary_id char(36) NOT NULL,
    attribute_name varchar(200) NOT NULL,
    attribute_bytes bytea NOT NULL,
    CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);

-- User 테이블 (기본 사용자 관리)
CREATE TABLE IF NOT EXISTS users (
    id bigserial PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    full_name varchar(100),
    enabled boolean NOT NULL DEFAULT true,
    locked boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version bigint NOT NULL DEFAULT 0
);

-- Role 테이블 (권한 관리)
CREATE TABLE IF NOT EXISTS roles (
    id bigserial PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE,
    description varchar(200),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version bigint NOT NULL DEFAULT 0
);

-- User-Role 매핑 테이블
CREATE TABLE IF NOT EXISTS user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Risk Management 테이블 (핵심 도메인)
CREATE TABLE IF NOT EXISTS risks (
    id bigserial PRIMARY KEY,
    title varchar(200) NOT NULL,
    description text,
    category varchar(50) NOT NULL,
    severity varchar(20) NOT NULL DEFAULT 'MEDIUM',
    status varchar(20) NOT NULL DEFAULT 'IDENTIFIED',
    probability integer CHECK (probability >= 1 AND probability <= 5),
    impact integer CHECK (impact >= 1 AND impact <= 5),
    owner_id bigint,
    created_by bigint NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version bigint NOT NULL DEFAULT 0,
    CONSTRAINT fk_risks_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT fk_risks_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Risk Mitigation Actions 테이블
CREATE TABLE IF NOT EXISTS risk_actions (
    id bigserial PRIMARY KEY,
    risk_id bigint NOT NULL,
    action_type varchar(20) NOT NULL DEFAULT 'MITIGATE',
    title varchar(200) NOT NULL,
    description text,
    status varchar(20) NOT NULL DEFAULT 'PLANNED',
    due_date date,
    assigned_to bigint,
    created_by bigint NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version bigint NOT NULL DEFAULT 0,
    CONSTRAINT fk_risk_actions_risk FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_actions_assignee FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_risk_actions_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 기본 데이터 삽입
INSERT INTO roles (name, description) VALUES 
    ('ADMIN', '시스템 관리자'),
    ('RISK_MANAGER', '리스크 관리자'),
    ('USER', '일반 사용자')
ON CONFLICT (name) DO NOTHING;

-- 인덱스 생성
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_severity ON risks(severity);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_created_by ON risks(created_by);
CREATE INDEX idx_risk_actions_risk_id ON risk_actions(risk_id);
CREATE INDEX idx_risk_actions_status ON risk_actions(status);