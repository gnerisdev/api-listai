/*
  Warnings:

  - You are about to drop the column `delete_at` on the `events_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `delete_at` on the `gifts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `events_gifts` DROP COLUMN `delete_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `gifts` DROP COLUMN `delete_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;
