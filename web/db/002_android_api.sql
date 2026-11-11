-- Better Auth migration と 001_saved_company.sql の後に実行する。
CREATE TABLE student_condition (
  user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  work_location VARCHAR(16) NOT NULL,
  minimum_monthly_salary_yen INT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT student_condition_user_fk
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE diagnosis (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  answers_json LONGTEXT NOT NULL,
  recommendations_json LONGTEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX diagnosis_user_created_idx (user_id, created_at, id),
  CONSTRAINT diagnosis_user_fk
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT diagnosis_answers_json_chk CHECK (JSON_VALID(answers_json)),
  CONSTRAINT diagnosis_recommendations_json_chk CHECK (JSON_VALID(recommendations_json))
);
