/*
  Warnings:

  - You are about to drop the column `image_cdn` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `events` DROP COLUMN `image_cdn`,
    DROP COLUMN `image_url`,
    ADD COLUMN `avatar_cdn` VARCHAR(191) NULL,
    ADD COLUMN `avatar_url` VARCHAR(191) NULL,
    ADD COLUMN `banner_cdn` VARCHAR(191) NULL,
    ADD COLUMN `banner_url` VARCHAR(191) NULL;
