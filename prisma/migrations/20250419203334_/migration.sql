/*
  Warnings:

  - You are about to drop the column `image_cdn` on the `event_gallery` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `event_gallery` table. All the data in the column will be lost.
  - Added the required column `file_cdn` to the `event_gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `event_gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `event_gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_gallery` DROP COLUMN `image_cdn`,
    DROP COLUMN `image_url`,
    ADD COLUMN `file_cdn` VARCHAR(191) NOT NULL,
    ADD COLUMN `file_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;
