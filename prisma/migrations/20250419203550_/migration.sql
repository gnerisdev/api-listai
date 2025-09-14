/*
  Warnings:

  - You are about to drop the column `file_cdn` on the `event_gallery` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `event_gallery` table. All the data in the column will be lost.
  - Added the required column `cdn` to the `event_gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `event_gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_gallery` DROP COLUMN `file_cdn`,
    DROP COLUMN `file_url`,
    ADD COLUMN `cdn` VARCHAR(191) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NOT NULL;
