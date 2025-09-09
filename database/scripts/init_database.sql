-- RSMS 데이터베이스 초기화 스크립트
-- 실행: sudo -u postgres psql < init_database.sql

-- 데이터베이스 생성
CREATE DATABASE rsms_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 데이터베이스에 접속
\c rsms_db;

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS rsms;

-- 권한 설정
GRANT ALL ON SCHEMA rsms TO postgres;

-- 기본 테이블 생성 예시
CREATE TABLE IF NOT EXISTS rsms.users (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    emp_no VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    active BOOLEAN DEFAULT true,
    created_id varchar(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_id varchar(100) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsms.roles (
    id SERIAL PRIMARY KEY,
	  role_id varchar(100) NOT NULL,                --'CEO' | 'EXECUTIVE' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' 등
	  role_name varchar(100) NOT NULL,              --'대표이사' | '임원' | '부서장' | '부서원' | '관리자' 등
    description varchar(500) NULL,
    created_id varchar(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_id varchar(100) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsms.responsibilities (
    id SERIAL PRIMARY KEY,
    content text NULL,
    ledger_order_id int8 NOT NULL,                      -- 원장차수
    date_expired date DEFAULT '9999-12-31'::date NULL,  -- 만료일
    use_yn CHAR(1) DEFAULT 'Y',
    created_id varchar(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_id varchar(100) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_users_userid ON rsms.users(userid);
CREATE INDEX idx_roles_role_id ON rsms.roles(role_id);
CREATE INDEX idx_responsibilities_ledger_order_id ON rsms.responsibilities(ledger_order_id);

-- 기본 데이터 삽입
INSERT INTO rsms.users (userid, email, password, role) VALUES
('admin', 'admin@rsms.com', '$2b$12$cpngzqfg1x8KWf.rG9g5Du2oJtJI2g3Faqm33cCCS.BgYInsUx65q', 'ADMIN');

-- 확인
\dt rsms.*
