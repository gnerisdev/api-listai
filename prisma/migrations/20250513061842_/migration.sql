/*
  Warnings:

  - You are about to drop the `payouts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `payouts` DROP FOREIGN KEY `payouts_event_gift_transaction_id_fkey`;

-- AlterTable
ALTER TABLE `events` ADD COLUMN `total_payout_received` DOUBLE NULL;

-- DropTable
DROP TABLE `payouts`;

-- CreateTable
CREATE TABLE `payout_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `event_id` INTEGER NOT NULL,
    `requested_amount` DOUBLE NOT NULL,
    `paid_amount` DOUBLE NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payout_requests` ADD CONSTRAINT `payout_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_requests` ADD CONSTRAINT `payout_requests_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
