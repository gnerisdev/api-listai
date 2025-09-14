/*
  Warnings:

  - You are about to drop the column `confirmed_at` on the `event_guests` table. All the data in the column will be lost.
  - You are about to drop the column `guest_email` on the `event_guests` table. All the data in the column will be lost.
  - You are about to drop the column `guest_phone_number` on the `event_guests` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `event_guests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id,email]` on the table `event_guests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `event_guests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `event_guests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `event_guests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `event_guests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_guests` DROP COLUMN `confirmed_at`,
    DROP COLUMN `guest_email`,
    DROP COLUMN `guest_phone_number`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `first_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone_number` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `event_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `event_messages_event_id_email_key`(`event_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `event_guests_event_id_email_key` ON `event_guests`(`event_id`, `email`);

-- AddForeignKey
ALTER TABLE `event_messages` ADD CONSTRAINT `event_messages_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
