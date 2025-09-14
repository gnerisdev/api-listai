-- AlterTable
ALTER TABLE `event_details` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `transmission` VARCHAR(191) NULL;
