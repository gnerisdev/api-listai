/*
  Warnings:

  - You are about to drop the `_UserEvents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_UserEvents` DROP FOREIGN KEY `_UserEvents_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserEvents` DROP FOREIGN KEY `_UserEvents_B_fkey`;

-- DropTable
DROP TABLE `_UserEvents`;

-- AddForeignKey
ALTER TABLE `users_events` ADD CONSTRAINT `user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_events` ADD CONSTRAINT `event_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
