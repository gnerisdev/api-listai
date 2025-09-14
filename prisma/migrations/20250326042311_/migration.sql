/*
  Warnings:

  - Added the required column `event_categories_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `events` ADD COLUMN `event_categories_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `events_gifts` (
    `event_id` INTEGER NOT NULL,
    `gift_id` INTEGER NOT NULL,
    `quantity` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `events_gifts_gift_id_idx`(`gift_id`),
    INDEX `events_gifts_event_id_idx`(`event_id`),
    PRIMARY KEY (`event_id`, `gift_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
