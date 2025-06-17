-- CreateTable
CREATE TABLE `event_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `event_location` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `full_address` VARCHAR(191) NULL,
    `transmission_link` VARCHAR(191) NULL,
    `transmission_password` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `event_details_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_details` ADD CONSTRAINT `event_details_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
