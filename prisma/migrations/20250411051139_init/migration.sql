-- CreateTable
CREATE TABLE `event_guests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guest_email` VARCHAR(191) NOT NULL,
    `guest_phone_number` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `confirmed` BOOLEAN NOT NULL DEFAULT false,
    `confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `event_guests_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_guests` ADD CONSTRAINT `event_guests_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
