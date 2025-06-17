/*
  Warnings:

  - Added the required column `payment_reference` to the `event_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_services` ADD COLUMN `payment_reference` VARCHAR(191) NOT NULL;
