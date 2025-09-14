-- AlterTable
ALTER TABLE `event_categories` ADD COLUMN `delete_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `event_types` ADD COLUMN `delete_at` DATETIME(3) NULL;
