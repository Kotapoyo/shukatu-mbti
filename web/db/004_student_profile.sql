-- 架空学生のプロフィール。希望条件は既存の student_condition を利用する。
CREATE TABLE student_profile (
  user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  graduation_year SMALLINT UNSIGNED NOT NULL,
  school_type VARCHAR(16) NOT NULL,
  age TINYINT UNSIGNED NULL,
  school_name VARCHAR(120) NOT NULL,
  major VARCHAR(120) NULL,
  gender VARCHAR(8) NULL,
  hobbies TEXT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT student_profile_user_fk
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT student_profile_year_chk CHECK (graduation_year BETWEEN 2020 AND 2100),
  CONSTRAINT student_profile_age_chk CHECK (age IS NULL OR age BETWEEN 15 AND 100),
  CONSTRAINT student_profile_school_type_chk CHECK (school_type IN ('大学', '短大', '専門学校', '高校卒')),
  CONSTRAINT student_profile_gender_chk CHECK (gender IS NULL OR gender IN ('女性', '男性', 'その他'))
);
