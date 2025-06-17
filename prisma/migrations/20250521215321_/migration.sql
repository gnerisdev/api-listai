/*
  Warnings:

  - Added the required column `expiration_at` to the `event_service_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_link` to the `event_service_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_service_transactions` ADD COLUMN `expiration_at` DATETIME(3) NOT NULL,
    ADD COLUMN `payment_link` VARCHAR(191) NOT NULL;
