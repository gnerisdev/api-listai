-- AlterTable
ALTER TABLE `event_categories` ADD COLUMN `image_cdn` VARCHAR(191) NULL,
    ADD COLUMN `image_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `event_types` ADD COLUMN `image_cdn` VARCHAR(191) NULL,
    ADD COLUMN `image_url` VARCHAR(191) NULL;
