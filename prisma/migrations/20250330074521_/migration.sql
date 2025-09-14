-- AlterTable
ALTER TABLE `events` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT '#432070',
    ADD COLUMN `title_description` VARCHAR(191) NULL;
