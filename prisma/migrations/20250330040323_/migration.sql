-- CreateTable
CREATE TABLE `_UserEvents` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserEvents_AB_unique`(`A`, `B`),
    INDEX `_UserEvents_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `users_events_user_id_idx` ON `users_events`(`user_id`);

-- CreateIndex
CREATE INDEX `users_events_event_id_idx` ON `users_events`(`event_id`);

-- AddForeignKey
ALTER TABLE `_UserEvents` ADD CONSTRAINT `_UserEvents_A_fkey` FOREIGN KEY (`A`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserEvents` ADD CONSTRAINT `_UserEvents_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
