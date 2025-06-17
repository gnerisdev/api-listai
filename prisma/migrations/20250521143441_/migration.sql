/*
  Warnings:

  - You are about to drop the `user_transitions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `event_services` DROP FOREIGN KEY `event_services_user_transition_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_transitions` DROP FOREIGN KEY `user_transitions_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_transitions` DROP FOREIGN KEY `user_transitions_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_transitions` DROP FOREIGN KEY `user_transitions_user_id_fkey`;

-- DropIndex
DROP INDEX `event_services_user_transition_id_fkey` ON `event_services`;

-- DropTable
DROP TABLE `user_transitions`;

-- CreateTable
CREATE TABLE `event_service_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `service_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NOT NULL,
    `status` ENUM('APPROVED', 'PENDING', 'RECUSED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',

    INDEX `event_service_transactions_event_id_idx`(`event_id`),
    INDEX `event_service_transactions_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_service_transactions` ADD CONSTRAINT `event_service_transactions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_service_transactions` ADD CONSTRAINT `event_service_transactions_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
