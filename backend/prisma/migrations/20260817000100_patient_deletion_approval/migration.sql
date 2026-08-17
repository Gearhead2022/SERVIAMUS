CREATE TABLE `patient_deletion_requests` (
  `deletion_request_id` INTEGER NOT NULL AUTO_INCREMENT,
  `patient_id` INTEGER NULL,
  `patient_name` VARCHAR(50) NOT NULL,
  `patient_code` VARCHAR(50) NULL,
  `requested_by` INTEGER NOT NULL,
  `reviewed_by` INTEGER NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `reason` VARCHAR(500) NULL,
  `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewed_at` DATETIME(3) NULL,

  UNIQUE INDEX `patient_deletion_requests_patient_id_key`(`patient_id`),
  INDEX `patient_deletion_requests_status_requested_at_idx`(`status`, `requested_at`),
  INDEX `patient_deletion_requests_requested_by_idx`(`requested_by`),
  PRIMARY KEY (`deletion_request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `patient_deletion_requests`
  ADD CONSTRAINT `patient_deletion_requests_patient_id_fkey`
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `patient_deletion_requests`
  ADD CONSTRAINT `patient_deletion_requests_requested_by_fkey`
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`user_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `patient_deletion_requests`
  ADD CONSTRAINT `patient_deletion_requests_reviewed_by_fkey`
  FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`user_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
