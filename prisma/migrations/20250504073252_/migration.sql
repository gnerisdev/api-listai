/*
  Warnings:

  - You are about to drop the column `delete_at` on the `event_categories` table. All the data in the column will be lost.
  - You are about to drop the column `delete_at` on the `event_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event_categories` DROP COLUMN `delete_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `event_types` DROP COLUMN `delete_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `deleted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
