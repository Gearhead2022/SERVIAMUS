-- The selected input unit is stored with the ionized-calcium result so the
-- printable record never has to guess whether the value is mmol/L or mg/dL.
ALTER TABLE `chemistry_results`
  ADD COLUMN `ionized_calcium_unit` VARCHAR(10) NULL AFTER `ionized_calcium`;
