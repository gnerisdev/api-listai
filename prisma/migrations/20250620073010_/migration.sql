/*
  Warnings:

  - You are about to alter the column `title` on the `gift_suggestions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.

*/
-- AlterTable
ALTER TABLE `events` ADD COLUMN `gift_delivery_preference` ENUM('weekOfParty', 'weekAfterParty', 'cash') NOT NULL DEFAULT 'cash';

-- AlterTable
ALTER TABLE `gift_suggestions` MODIFY `title` VARCHAR(150) NOT NULL;
