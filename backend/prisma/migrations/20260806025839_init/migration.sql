-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` TEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `license_no` VARCHAR(20) NULL,
    `title` VARCHAR(50) NULL,
    `ptr_no` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL,
    `role_desc` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    INDEX `user_roles_user_id_idx`(`user_id`),
    INDEX `user_roles_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vital_signs` (
    `vs_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `bp` VARCHAR(20) NULL,
    `temp` VARCHAR(20) NULL,
    `cr` VARCHAR(20) NULL,
    `rr` VARCHAR(20) NULL,
    `wt` VARCHAR(20) NULL,
    `ht` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`vs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultation` (
    `consultation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `cons_id` INTEGER NOT NULL,
    `vs_id` INTEGER NULL,
    `phr_id` INTEGER NULL,
    `consultation_date` DATE NOT NULL,
    `chief_complaint` VARCHAR(191) NULL,
    `hist_illness` VARCHAR(191) NULL,
    `examination` VARCHAR(191) NULL,
    `assessment` VARCHAR(191) NULL,
    `plans` VARCHAR(191) NULL,
    `follow_up_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consultation_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`consultation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultation_records` (
    `phr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `pmh_allergy` BOOLEAN NOT NULL DEFAULT false,
    `pmh_admission` BOOLEAN NOT NULL DEFAULT false,
    `pmh_others` BOOLEAN NOT NULL DEFAULT false,
    `pmh_others_text` VARCHAR(191) NULL,
    `fh_htn` BOOLEAN NOT NULL DEFAULT false,
    `fh_dm` BOOLEAN NOT NULL DEFAULT false,
    `fh_ba` BOOLEAN NOT NULL DEFAULT false,
    `fh_cancer` BOOLEAN NOT NULL DEFAULT false,
    `fh_others` BOOLEAN NOT NULL DEFAULT false,
    `fh_others_text` VARCHAR(191) NULL,
    `ob_score` VARCHAR(191) NULL,
    `ob_nvsd` BOOLEAN NOT NULL DEFAULT false,
    `ob_cs` BOOLEAN NOT NULL DEFAULT false,
    `menarche` VARCHAR(100) NULL,
    `interval` VARCHAR(100) NULL,
    `duration` VARCHAR(100) NULL,
    `amount` VARCHAR(100) NULL,
    `ob_symptoms` VARCHAR(100) NULL,
    `cigarette_use` BOOLEAN NOT NULL DEFAULT false,
    `alcohol_use` BOOLEAN NOT NULL DEFAULT false,
    `drug_use` BOOLEAN NOT NULL DEFAULT false,
    `exercise` BOOLEAN NOT NULL DEFAULT false,
    `hygiene_prac` BOOLEAN NOT NULL DEFAULT false,
    `coffee_cons` BOOLEAN NOT NULL DEFAULT false,
    `soda_cons` BOOLEAN NOT NULL DEFAULT false,
    `sh_allergy` BOOLEAN NOT NULL DEFAULT false,
    `sh_admission` BOOLEAN NOT NULL DEFAULT false,
    `travel_history` VARCHAR(100) NULL,
    `diet` VARCHAR(100) NULL,
    `stress` VARCHAR(100) NULL,
    `occupation` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `consultation_records_patient_id_key`(`patient_id`),
    INDEX `consultation_records_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`phr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultation_follow_up` (
    `followup_id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultation_id` INTEGER NOT NULL,
    `follow_up_date` DATETIME(3) NOT NULL,
    `vs_id` INTEGER NULL,
    `impression` TEXT NULL,
    `instruction` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consultation_follow_up_followup_id_idx`(`followup_id`),
    PRIMARY KEY (`followup_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request` (
    `req_id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_code` VARCHAR(191) NULL,
    `patient_id` INTEGER NOT NULL,
    `req_type` ENUM('CONSULTATION', 'LABORATORY', 'CERTIFICATE') NOT NULL,
    `status` ENUM('WAITING', 'SERVING', 'CANCELED', 'DONE') NOT NULL,
    `req_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `request_request_code_key`(`request_code`),
    INDEX `request_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`req_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultation_request` (
    `cons_id` INTEGER NOT NULL AUTO_INCREMENT,
    `req_id` INTEGER NOT NULL,
    `vs_id` INTEGER NOT NULL,
    `case_consultation_id` INTEGER NULL,
    `physician` INTEGER NOT NULL,
    `is_follow_up` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `consultation_request_req_id_key`(`req_id`),
    PRIMARY KEY (`cons_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `med_cert_request` (
    `mcr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `req_id` INTEGER NOT NULL,
    `physician` INTEGER NOT NULL,
    `purpose` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `med_cert_request_req_id_key`(`req_id`),
    PRIMARY KEY (`mcr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `med_cert_results` (
    `med_cert_id` INTEGER NOT NULL AUTO_INCREMENT,
    `mcr_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `purpose` VARCHAR(50) NOT NULL,
    `impression` TEXT NULL,
    `recommendation` TEXT NULL,
    `result_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `med_cert_results_mcr_id_key`(`mcr_id`),
    INDEX `med_cert_results_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`med_cert_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptions` (
    `presc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultation_id` INTEGER NOT NULL,
    `followup_id` INTEGER NULL,
    `patient_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `gen_notes` VARCHAR(191) NULL,
    `issued_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`presc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescription_items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `presc_id` INTEGER NOT NULL,
    `medicine_name` VARCHAR(191) NOT NULL,
    `strength` VARCHAR(191) NULL,
    `brand_name` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NULL,
    `instruction` VARCHAR(191) NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `req_id` INTEGER NOT NULL,
    `req_by` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `laboratory_request_req_id_key`(`req_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_tests` (
    `test_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('Clinical_Chemistry', 'Clinical_Microscopy', 'Serology', 'Hematology', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `schema_key` VARCHAR(50) NULL,

    PRIMARY KEY (`test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory_request_items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `laboratory_request_id` INTEGER NOT NULL,
    `test_id` INTEGER NOT NULL,
    `status` ENUM('QUEUED', 'PROCESSING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `result_payload` JSON NULL,
    `processed_by` INTEGER NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `laboratory_request_items_laboratory_request_id_idx`(`laboratory_request_id`),
    INDEX `laboratory_request_items_status_idx`(`status`),
    INDEX `laboratory_request_items_processed_by_idx`(`processed_by`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hematology_results` (
    `ht_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `hemoglobin` VARCHAR(50) NULL,
    `rbc_count` VARCHAR(50) NULL,
    `wbc_count` VARCHAR(50) NULL,
    `platelet_count` VARCHAR(50) NULL,
    `others_mcv` VARCHAR(50) NULL,
    `mchc` VARCHAR(50) NULL,
    `reticulocyte_count` VARCHAR(50) NULL,
    `nss_1` VARCHAR(50) NULL,
    `nss_2` VARCHAR(50) NULL,
    `nss_3` VARCHAR(50) NULL,
    `lymphocytes` VARCHAR(50) NULL,
    `monocytes` VARCHAR(50) NULL,
    `eosinophils` VARCHAR(50) NULL,
    `basophils` VARCHAR(50) NULL,
    `others1` TEXT NULL,
    `clotting_time` VARCHAR(50) NULL,
    `bleeding_time` VARCHAR(50) NULL,
    `blood_type` VARCHAR(20) NULL,
    `abo_type` VARCHAR(20) NULL,
    `rh_type` VARCHAR(20) NULL,
    `others2` TEXT NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `hematology_results_lab_id_key`(`lab_id`),
    INDEX `hematology_results_patient_id_idx`(`patient_id`),
    INDEX `hematology_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `hematology_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`ht_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serology_results` (
    `st_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `test_name` VARCHAR(100) NULL,
    `method` VARCHAR(100) NULL,
    `specimen` VARCHAR(100) NULL,
    `result` TEXT NULL,
    `day_of_fever` VARCHAR(50) NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `serology_results_lab_id_key`(`lab_id`),
    INDEX `serology_results_patient_id_idx`(`patient_id`),
    INDEX `serology_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `serology_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`st_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parasitology_results` (
    `pr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `time_collected` VARCHAR(50) NULL,
    `time_received` VARCHAR(50) NULL,
    `color` VARCHAR(50) NULL,
    `consistency` VARCHAR(50) NULL,
    `pus_cells` VARCHAR(50) NULL,
    `rbc` VARCHAR(50) NULL,
    `bacteria` VARCHAR(50) NULL,
    `hookworm` VARCHAR(50) NULL,
    `ascaris` VARCHAR(50) NULL,
    `trichuris` VARCHAR(50) NULL,
    `strongloides` VARCHAR(50) NULL,
    `histolytica_cyst` VARCHAR(50) NULL,
    `histolytica_trophozoite` VARCHAR(50) NULL,
    `coli_cyst` VARCHAR(50) NULL,
    `coli_trophozoite` VARCHAR(50) NULL,
    `others` TEXT NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `parasitology_results_lab_id_key`(`lab_id`),
    INDEX `parasitology_results_patient_id_idx`(`patient_id`),
    INDEX `parasitology_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `parasitology_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`pr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `urinalysis_results` (
    `ur_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `color` VARCHAR(50) NULL,
    `transparency` VARCHAR(50) NULL,
    `ph_result` VARCHAR(50) NULL,
    `spec_grav_result` VARCHAR(50) NULL,
    `protein` VARCHAR(50) NULL,
    `nitrite` VARCHAR(50) NULL,
    `glucose` VARCHAR(50) NULL,
    `ketones` VARCHAR(50) NULL,
    `leukocytes` VARCHAR(50) NULL,
    `blood` VARCHAR(50) NULL,
    `pus_cells` VARCHAR(50) NULL,
    `rbc` VARCHAR(50) NULL,
    `bacteria` VARCHAR(50) NULL,
    `squamous_cell` VARCHAR(50) NULL,
    `round_cell` VARCHAR(50) NULL,
    `mucous` VARCHAR(50) NULL,
    `crystals` VARCHAR(50) NULL,
    `casts` VARCHAR(50) NULL,
    `others` TEXT NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `urinalysis_results_lab_id_key`(`lab_id`),
    INDEX `urinalysis_results_patient_id_idx`(`patient_id`),
    INDEX `urinalysis_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `urinalysis_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`ur_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinical_chemistry_results` (
    `cc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `fbs` VARCHAR(50) NULL,
    `rbs` VARCHAR(50) NULL,
    `bun` VARCHAR(50) NULL,
    `creatinine` VARCHAR(50) NULL,
    `uric_acid` VARCHAR(50) NULL,
    `cholesterol` VARCHAR(50) NULL,
    `hdl_cholesterol` VARCHAR(50) NULL,
    `ldl_cholesterol` VARCHAR(50) NULL,
    `triglycerides` VARCHAR(50) NULL,
    `sgpt` VARCHAR(50) NULL,
    `fbs_conv` VARCHAR(50) NULL,
    `rbs_conv` VARCHAR(50) NULL,
    `bun_conv` VARCHAR(50) NULL,
    `creatinine_conv` VARCHAR(50) NULL,
    `uric_acid_conv` VARCHAR(50) NULL,
    `cholesterol_conv` VARCHAR(50) NULL,
    `hdl_cholesterol_conv` VARCHAR(50) NULL,
    `ldl_cholesterol_conv` VARCHAR(50) NULL,
    `triglycerides_conv` VARCHAR(50) NULL,
    `last_meal` VARCHAR(100) NULL,
    `time_taken` VARCHAR(100) NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `clinical_chemistry_results_lab_id_key`(`lab_id`),
    INDEX `clinical_chemistry_results_patient_id_idx`(`patient_id`),
    INDEX `clinical_chemistry_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `clinical_chemistry_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`cc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hba1c_results` (
    `hba_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `test_method` VARCHAR(100) NULL,
    `lot_no` VARCHAR(100) NULL,
    `exp_date` DATE NULL,
    `specimen` VARCHAR(100) NULL,
    `result` VARCHAR(50) NULL,
    `result_interpretation` TEXT NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `hba1c_results_lab_id_key`(`lab_id`),
    INDEX `hba1c_results_patient_id_idx`(`patient_id`),
    INDEX `hba1c_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `hba1c_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`hba_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chemistry_results` (
    `c_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `sodium` VARCHAR(50) NULL,
    `potassium` VARCHAR(50) NULL,
    `chloride` VARCHAR(50) NULL,
    `ionized_calcium` VARCHAR(50) NULL,
    `others` TEXT NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `chemistry_results_lab_id_key`(`lab_id`),
    INDEX `chemistry_results_patient_id_idx`(`patient_id`),
    INDEX `chemistry_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `chemistry_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`c_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ogtt_results` (
    `ogtt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `test_type` VARCHAR(100) NULL,
    `fbs` VARCHAR(50) NULL,
    `fbs_conv` VARCHAR(50) NULL,
    `one_hour_after_load` VARCHAR(50) NULL,
    `one_hour_after_load_conv` VARCHAR(50) NULL,
    `two_hour_after_load` VARCHAR(50) NULL,
    `two_hour_after_load_conv` VARCHAR(50) NULL,
    `three_hour_after_load` VARCHAR(50) NULL,
    `three_hour_after_load_conv` VARCHAR(50) NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `ogtt_results_lab_id_key`(`lab_id`),
    INDEX `ogtt_results_patient_id_idx`(`patient_id`),
    INDEX `ogtt_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `ogtt_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`ogtt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `queue` (
    `queue_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `req_id` INTEGER NOT NULL,
    `queue_type` ENUM('CONSULTATION', 'LABORATORY') NOT NULL,
    `queue_number` INTEGER NOT NULL,
    `status` ENUM('WAITING', 'SERVING', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'WAITING',
    `req_date` DATE NOT NULL,
    `serving_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `queue_req_id_key`(`req_id`),
    INDEX `queue_patient_id_idx`(`patient_id`),
    INDEX `queue_queue_type_idx`(`queue_type`),
    INDEX `queue_req_id_idx`(`req_id`),
    INDEX `queue_status_idx`(`status`),
    PRIMARY KEY (`queue_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients` (
    `patient_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_code` VARCHAR(191) NULL,
    `name` VARCHAR(50) NOT NULL,
    `address` TEXT NOT NULL,
    `contact_number` VARCHAR(50) NOT NULL,
    `birth_date` DATE NOT NULL,
    `religion` VARCHAR(50) NULL,
    `sex` ENUM('male', 'female') NOT NULL,
    `age` INTEGER NULL,
    `philhealth_id` VARCHAR(191) NULL,
    `last_medical_assistance_year` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `patients_patient_code_key`(`patient_code`),
    PRIMARY KEY (`patient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `service_id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference_id` INTEGER NOT NULL,
    `category` ENUM('CONSULTATION', 'LABORATORY', 'CERTIFICATE', 'OTHER') NOT NULL,
    `service_name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`service_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `biling` (
    `billing_id` INTEGER NOT NULL AUTO_INCREMENT,
    `billing_code` VARCHAR(20) NOT NULL,
    `req_id` INTEGER NOT NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `date` DATE NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL,
    `discount_reason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'DONE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `biling_billing_code_key`(`billing_code`),
    UNIQUE INDEX `biling_req_id_key`(`req_id`),
    PRIMARY KEY (`billing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `billing_id` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method` ENUM('CASH', 'GCASH', 'CARD', 'BANK_TRANSFER') NOT NULL,
    `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference_no` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notif_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('NEW_REQUEST', 'APPROVED', 'REJECTED', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NULL,
    `entity_id` INTEGER NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read_at` DATETIME(3) NULL,

    INDEX `Notification_user_id_idx`(`user_id`),
    INDEX `Notification_entity_entity_id_idx`(`entity`, `entity_id`),
    PRIMARY KEY (`notif_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FOBT_results` (
    `fobt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `lab_id` INTEGER NOT NULL,
    `test_name` VARCHAR(100) NULL,
    `method` VARCHAR(100) NULL,
    `specimen` VARCHAR(100) NULL,
    `result` TEXT NULL,
    `day_of_fever` VARCHAR(50) NULL,
    `med_tech_user_id` INTEGER NULL,
    `pth_user_id` INTEGER NULL,
    `result_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `FOBT_results_lab_id_key`(`lab_id`),
    INDEX `FOBT_results_patient_id_idx`(`patient_id`),
    INDEX `FOBT_results_med_tech_user_id_idx`(`med_tech_user_id`),
    INDEX `FOBT_results_pth_user_id_idx`(`pth_user_id`),
    PRIMARY KEY (`fobt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vital_signs` ADD CONSTRAINT `vital_signs_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_vs_id_fkey` FOREIGN KEY (`vs_id`) REFERENCES `vital_signs`(`vs_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_phr_id_fkey` FOREIGN KEY (`phr_id`) REFERENCES `consultation_records`(`phr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_cons_id_fkey` FOREIGN KEY (`cons_id`) REFERENCES `consultation_request`(`cons_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_records` ADD CONSTRAINT `consultation_records_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_follow_up` ADD CONSTRAINT `consultation_follow_up_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultation`(`consultation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_follow_up` ADD CONSTRAINT `consultation_follow_up_vs_id_fkey` FOREIGN KEY (`vs_id`) REFERENCES `vital_signs`(`vs_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `request_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_request` ADD CONSTRAINT `consultation_request_req_id_fkey` FOREIGN KEY (`req_id`) REFERENCES `request`(`req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_request` ADD CONSTRAINT `consultation_request_vs_id_fkey` FOREIGN KEY (`vs_id`) REFERENCES `vital_signs`(`vs_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_request` ADD CONSTRAINT `consultation_request_physician_fkey` FOREIGN KEY (`physician`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_request` ADD CONSTRAINT `consultation_request_case_consultation_id_fkey` FOREIGN KEY (`case_consultation_id`) REFERENCES `consultation`(`consultation_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `med_cert_request` ADD CONSTRAINT `med_cert_request_req_id_fkey` FOREIGN KEY (`req_id`) REFERENCES `request`(`req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `med_cert_request` ADD CONSTRAINT `med_cert_request_physician_fkey` FOREIGN KEY (`physician`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `med_cert_results` ADD CONSTRAINT `med_cert_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `med_cert_results` ADD CONSTRAINT `med_cert_results_mcr_id_fkey` FOREIGN KEY (`mcr_id`) REFERENCES `med_cert_request`(`mcr_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultation`(`consultation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_followup_id_fkey` FOREIGN KEY (`followup_id`) REFERENCES `consultation_follow_up`(`followup_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription_items` ADD CONSTRAINT `prescription_items_presc_id_fkey` FOREIGN KEY (`presc_id`) REFERENCES `prescriptions`(`presc_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_request` ADD CONSTRAINT `laboratory_request_req_id_fkey` FOREIGN KEY (`req_id`) REFERENCES `request`(`req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_request_items` ADD CONSTRAINT `laboratory_request_items_laboratory_request_id_fkey` FOREIGN KEY (`laboratory_request_id`) REFERENCES `laboratory_request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_request_items` ADD CONSTRAINT `laboratory_request_items_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `laboratory_tests`(`test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory_request_items` ADD CONSTRAINT `laboratory_request_items_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hematology_results` ADD CONSTRAINT `hematology_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hematology_results` ADD CONSTRAINT `hematology_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hematology_results` ADD CONSTRAINT `hematology_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hematology_results` ADD CONSTRAINT `hematology_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serology_results` ADD CONSTRAINT `serology_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serology_results` ADD CONSTRAINT `serology_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serology_results` ADD CONSTRAINT `serology_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serology_results` ADD CONSTRAINT `serology_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parasitology_results` ADD CONSTRAINT `parasitology_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parasitology_results` ADD CONSTRAINT `parasitology_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parasitology_results` ADD CONSTRAINT `parasitology_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parasitology_results` ADD CONSTRAINT `parasitology_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urinalysis_results` ADD CONSTRAINT `urinalysis_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urinalysis_results` ADD CONSTRAINT `urinalysis_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urinalysis_results` ADD CONSTRAINT `urinalysis_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urinalysis_results` ADD CONSTRAINT `urinalysis_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_chemistry_results` ADD CONSTRAINT `clinical_chemistry_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_chemistry_results` ADD CONSTRAINT `clinical_chemistry_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_chemistry_results` ADD CONSTRAINT `clinical_chemistry_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_chemistry_results` ADD CONSTRAINT `clinical_chemistry_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hba1c_results` ADD CONSTRAINT `hba1c_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hba1c_results` ADD CONSTRAINT `hba1c_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hba1c_results` ADD CONSTRAINT `hba1c_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hba1c_results` ADD CONSTRAINT `hba1c_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistry_results` ADD CONSTRAINT `chemistry_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistry_results` ADD CONSTRAINT `chemistry_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistry_results` ADD CONSTRAINT `chemistry_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistry_results` ADD CONSTRAINT `chemistry_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ogtt_results` ADD CONSTRAINT `ogtt_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ogtt_results` ADD CONSTRAINT `ogtt_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ogtt_results` ADD CONSTRAINT `ogtt_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ogtt_results` ADD CONSTRAINT `ogtt_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queue` ADD CONSTRAINT `queue_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queue` ADD CONSTRAINT `queue_req_id_fkey` FOREIGN KEY (`req_id`) REFERENCES `request`(`req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `biling` ADD CONSTRAINT `biling_req_id_fkey` FOREIGN KEY (`req_id`) REFERENCES `request`(`req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_billing_id_fkey` FOREIGN KEY (`billing_id`) REFERENCES `biling`(`billing_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FOBT_results` ADD CONSTRAINT `FOBT_results_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FOBT_results` ADD CONSTRAINT `FOBT_results_lab_id_fkey` FOREIGN KEY (`lab_id`) REFERENCES `laboratory_request_items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FOBT_results` ADD CONSTRAINT `FOBT_results_med_tech_user_id_fkey` FOREIGN KEY (`med_tech_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FOBT_results` ADD CONSTRAINT `FOBT_results_pth_user_id_fkey` FOREIGN KEY (`pth_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
