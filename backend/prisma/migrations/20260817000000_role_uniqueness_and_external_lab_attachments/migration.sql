-- Preserve existing user-role assignments while removing duplicate role names
-- created by earlier non-idempotent role seeding.
INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`)
SELECT duplicate_assignment.`user_id`, canonical_role.`role_id`
FROM `user_roles` AS duplicate_assignment
INNER JOIN `roles` AS duplicate_role
  ON duplicate_role.`role_id` = duplicate_assignment.`role_id`
INNER JOIN `roles` AS canonical_role
  ON canonical_role.`role_name` = duplicate_role.`role_name`
  AND canonical_role.`role_id` < duplicate_role.`role_id`;

DELETE duplicate_assignment
FROM `user_roles` AS duplicate_assignment
INNER JOIN `roles` AS duplicate_role
  ON duplicate_role.`role_id` = duplicate_assignment.`role_id`
INNER JOIN `roles` AS canonical_role
  ON canonical_role.`role_name` = duplicate_role.`role_name`
  AND canonical_role.`role_id` < duplicate_role.`role_id`;

DELETE duplicate_role
FROM `roles` AS duplicate_role
INNER JOIN `roles` AS canonical_role
  ON canonical_role.`role_name` = duplicate_role.`role_name`
  AND canonical_role.`role_id` < duplicate_role.`role_id`;

CREATE UNIQUE INDEX `roles_role_name_key` ON `roles`(`role_name`);

CREATE TABLE `external_lab_attachments` (
  `attachment_id` INTEGER NOT NULL AUTO_INCREMENT,
  `patient_id` INTEGER NOT NULL,
  `lab_id` INTEGER NULL,
  `uploaded_by` INTEGER NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INTEGER NOT NULL,
  `source_laboratory` VARCHAR(150) NULL,
  `description` VARCHAR(500) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `external_lab_attachments_stored_name_key`(`stored_name`),
  INDEX `external_lab_attachments_patient_id_created_at_idx`(`patient_id`, `created_at`),
  INDEX `external_lab_attachments_lab_id_idx`(`lab_id`),
  INDEX `external_lab_attachments_uploaded_by_idx`(`uploaded_by`),
  PRIMARY KEY (`attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `external_lab_attachments`
  ADD CONSTRAINT `external_lab_attachments_patient_id_fkey`
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `external_lab_attachments`
  ADD CONSTRAINT `external_lab_attachments_uploaded_by_fkey`
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
