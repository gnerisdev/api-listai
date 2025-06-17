/*
  Warnings:

  - You are about to drop the column `giftsId` on the `event_gift_transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `event_gift_transactions` DROP FOREIGN KEY `event_gift_transactions_giftsId_fkey`;

-- DropIndex
DROP INDEX `event_gift_transactions_giftsId_fkey` ON `event_gift_transactions`;

-- AlterTable
ALTER TABLE `event_gift_transactions` DROP COLUMN `giftsId`;
