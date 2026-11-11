-- Androidの保存企業に、その提案を作成した診断を紐づける。既存Web保存行はNULLのまま保持する。
ALTER TABLE saved_company
  ADD COLUMN diagnosis_id CHAR(36) NULL,
  ADD INDEX saved_company_diagnosis_idx (diagnosis_id),
  ADD CONSTRAINT saved_company_diagnosis_fk
    FOREIGN KEY (diagnosis_id) REFERENCES diagnosis(id) ON DELETE SET NULL;
