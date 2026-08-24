-- Keep RBC morphology as a structured urinalysis result while preserving the
-- original form payload used by the printable report.
ALTER TABLE `urinalysis_results`
  ADD COLUMN `morphology` VARCHAR(255) NULL AFTER `rbc`;
