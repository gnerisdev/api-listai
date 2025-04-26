-- CreateTable
CREATE TABLE `event_gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_url` VARCHAR(191) NOT NULL,
    `image_cdn` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `event_gallery_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_gallery` ADD CONSTRAINT `event_gallery_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
