-- CreateTable
CREATE TABLE `event_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `event_id` INTEGER NOT NULL,
    `show_gift_list` BOOLEAN NOT NULL DEFAULT true,
    `show_guest_messages` BOOLEAN NOT NULL DEFAULT true,
    `show_event_info` BOOLEAN NOT NULL DEFAULT true,
    `allow_guest_confirmation` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `event_settings_user_id_idx`(`user_id`),
    INDEX `event_settings_event_id_idx`(`event_id`),
    UNIQUE INDEX `event_settings_user_id_event_id_key`(`user_id`, `event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_settings` ADD CONSTRAINT `event_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_settings` ADD CONSTRAINT `event_settings_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
