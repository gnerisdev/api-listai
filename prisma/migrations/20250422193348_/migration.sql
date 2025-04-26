/*
  Warnings:

  - You are about to drop the column `payment_reference` on the `event_services` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `event_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event_services` DROP COLUMN `payment_reference`,
    DROP COLUMN `payment_status`;

-- CreateTable
CREATE TABLE `user_transitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `service_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NOT NULL,
    `status` ENUM('APPROVED', 'PENDING', 'RECUSED') NOT NULL DEFAULT 'PENDING',

    INDEX `user_transitions_event_id_idx`(`event_id`),
    INDEX `user_transitions_user_id_idx`(`user_id`),
    INDEX `user_transitions_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_transitions` ADD CONSTRAINT `user_transitions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_transitions` ADD CONSTRAINT `user_transitions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_transitions` ADD CONSTRAINT `user_transitions_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
