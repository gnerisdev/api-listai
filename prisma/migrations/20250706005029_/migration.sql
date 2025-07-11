-- CreateTable
CREATE TABLE `pre_user_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `payment_status` ENUM('APPROVED', 'PENDING', 'RECUSED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_link` VARCHAR(191) NULL,
    `payment_reference` VARCHAR(191) NULL,
    `account_created` BOOLEAN NOT NULL DEFAULT false,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pre_user_requests_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
