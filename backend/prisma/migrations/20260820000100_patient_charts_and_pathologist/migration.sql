-- Patient chart attachments remain segregated from external laboratory attachments.
CREATE TABLE `patient_chart_attachments` (
    `attachment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `uploaded_by` INTEGER NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `stored_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `patient_chart_attachments_stored_name_key`(`stored_name`),
    INDEX `patient_chart_attachments_patient_id_created_at_idx`(`patient_id`, `created_at`),
    INDEX `patient_chart_attachments_uploaded_by_idx`(`uploaded_by`),
    PRIMARY KEY (`attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `patient_chart_attachments`
  ADD CONSTRAINT `patient_chart_attachments_patient_id_fkey`
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `patient_chart_attachments`
  ADD CONSTRAINT `patient_chart_attachments_uploaded_by_fkey`
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Idempotent role creation. Existing accounts are deliberately left unchanged.
INSERT INTO `roles` (`role_name`, `role_desc`, `created_at`)
SELECT 'PATHOLOGIST', 'Pathologist', CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `role_name` = 'PATHOLOGIST');
