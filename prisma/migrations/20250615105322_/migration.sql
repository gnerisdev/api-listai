/*
  Warnings:

  - You are about to drop the column `system_fee` on the `event_gift_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_fee` on the `event_gift_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event_gift_transactions` DROP COLUMN `system_fee`,
    DROP COLUMN `transaction_fee`,
    ADD COLUMN `percentage` INTEGER NULL;
