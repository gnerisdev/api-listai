/*
  Warnings:

  - Added the required column `password` to the `pre_user_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pre_user_requests` ADD COLUMN `password` VARCHAR(191) NOT NULL;
