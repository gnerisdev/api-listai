/*
  Warnings:

  - Added the required column `contact` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guest_transitions` ADD COLUMN `contact` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
