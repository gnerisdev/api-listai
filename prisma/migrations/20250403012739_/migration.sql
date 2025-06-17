-- AlterTable
ALTER TABLE `events_gifts` ADD COLUMN `delete_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `gifts` ADD COLUMN `delete_at` DATETIME(3) NULL;
