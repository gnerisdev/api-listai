/*
  Warnings:

  - You are about to drop the `guest_transition_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guest_transitions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `guest_transition_items` DROP FOREIGN KEY `guest_transition_items_gift_id_fkey`;

-- DropForeignKey
ALTER TABLE `guest_transition_items` DROP FOREIGN KEY `guest_transition_items_guest_transition_id_fkey`;

-- DropForeignKey
ALTER TABLE `guest_transitions` DROP FOREIGN KEY `guest_transitions_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `guest_transitions` DROP FOREIGN KEY `guest_transitions_giftsId_fkey`;

-- DropTable
DROP TABLE `guest_transition_items`;

-- DropTable
DROP TABLE `guest_transitions`;

-- CreateTable
CREATE TABLE `event_gift_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `guest_name` VARCHAR(191) NOT NULL,
    `guest_contact` VARCHAR(191) NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `user_amount` DOUBLE NULL,
    `system_fee` DOUBLE NULL,
    `transaction_fee` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NOT NULL,
    `status` ENUM('APPROVED', 'PENDING', 'RECUSED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `giftsId` INTEGER NULL,

    INDEX `event_gift_transactions_event_id_idx`(`event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_gift_transaction_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_gift_transaction_id` INTEGER NOT NULL,
    `gift_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `gift_name` VARCHAR(191) NOT NULL,
    `unit_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transition_id` INTEGER NOT NULL,
    `event_gift_transaction_id` INTEGER NOT NULL,
    `recipient_id` INTEGER NOT NULL,
    `recipient_type` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(191) NULL,
    `transaction_ref` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `payouts_transition_id_idx`(`transition_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_gift_transactions` ADD CONSTRAINT `event_gift_transactions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_gift_transactions` ADD CONSTRAINT `event_gift_transactions_giftsId_fkey` FOREIGN KEY (`giftsId`) REFERENCES `gifts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_gift_transaction_items` ADD CONSTRAINT `event_gift_transaction_items_event_gift_transaction_id_fkey` FOREIGN KEY (`event_gift_transaction_id`) REFERENCES `event_gift_transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_gift_transaction_items` ADD CONSTRAINT `event_gift_transaction_items_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_event_gift_transaction_id_fkey` FOREIGN KEY (`event_gift_transaction_id`) REFERENCES `event_gift_transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
