/*
  Warnings:

  - You are about to drop the column `suggestion` on the `gift_suggestions` table. All the data in the column will be lost.
  - Added the required column `description` to the `gift_suggestions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `gift_suggestions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `gift_suggestions` DROP COLUMN `suggestion`,
    ADD COLUMN `description` VARCHAR(500) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
