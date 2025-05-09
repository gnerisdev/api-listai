-- CreateTable
CREATE TABLE `guest_transitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `gift_id` INTEGER NOT NULL,
    `guest_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NOT NULL,
    `status` ENUM('APPROVED', 'PENDING', 'RECUSED') NOT NULL DEFAULT 'PENDING',

    INDEX `guest_transitions_event_id_idx`(`event_id`),
    INDEX `guest_transitions_guest_id_idx`(`guest_id`),
    INDEX `guest_transitions_gift_id_idx`(`gift_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guest_transitions` ADD CONSTRAINT `guest_transitions_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `event_guests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_transitions` ADD CONSTRAINT `guest_transitions_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_transitions` ADD CONSTRAINT `guest_transitions_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
