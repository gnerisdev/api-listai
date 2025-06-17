/*
  Warnings:

  - You are about to drop the `events_gifts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `events_gifts` DROP FOREIGN KEY `events_gifts_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `events_gifts` DROP FOREIGN KEY `events_gifts_gift_id_fkey`;

-- DropTable
DROP TABLE `events_gifts`;

-- CreateTable
CREATE TABLE `event_gifts` (
    `event_id` INTEGER NOT NULL,
    `gift_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `event_gifts_gift_id_idx`(`gift_id`),
    INDEX `event_gifts_event_id_idx`(`event_id`),
    PRIMARY KEY (`event_id`, `gift_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_gifts` ADD CONSTRAINT `event_gifts_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_gifts` ADD CONSTRAINT `event_gifts_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
