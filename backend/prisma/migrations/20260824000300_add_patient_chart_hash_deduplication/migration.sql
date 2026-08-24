-- A checksum prevents duplicate uploads of the same scan to one patient's chart.
ALTER TABLE `patient_chart_attachments`
  ADD COLUMN `content_sha256` CHAR(64) NULL AFTER `file_size`;

CREATE UNIQUE INDEX `patient_chart_attachments_patient_id_content_sha256_key`
  ON `patient_chart_attachments`(`patient_id`, `content_sha256`);
