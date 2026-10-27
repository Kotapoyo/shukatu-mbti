CREATE TABLE saved_company (
  user_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  saved_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, company_id),
  CONSTRAINT saved_company_user_fk
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
