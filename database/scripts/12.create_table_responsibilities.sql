
-- DROP TABLE rsms.responsibilities CASCADE;

CREATE TABLE rsms.responsibilities (
  id SERIAL PRIMARY KEY,
  content text NULL,
  ledger_order_id int8 NOT NULL,                      -- 원장차수
  date_expired date DEFAULT '9999-12-31'::date NULL,  -- 만료일
  active BOOLEAN DEFAULT true,
  created_id varchar(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id varchar(100) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_responsibilities_id ON rsms.responsibilities(id);
CREATE INDEX idx_responsibilities_ledger_order_id ON rsms.responsibilities(ledger_order_id);
