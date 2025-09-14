/*
  Warnings:

  - You are about to drop the column `gift_id` on the `guest_transitions` table. All the data in the column will be lost.
  - You are about to drop the column `gift_name` on the `guest_transitions` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `guest_transitions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `guest_transitions` DROP FOREIGN KEY `guest_transitions_gift_id_fkey`;

-- DropIndex
DROP INDEX `guest_transitions_gift_id_fkey` ON `guest_transitions`;

-- AlterTable
ALTER TABLE `guest_transitions` DROP COLUMN `gift_id`,
    DROP COLUMN `gift_name`,
    DROP COLUMN `quantity`,
    ADD COLUMN `giftsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `guest_transition_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guest_transition_id` INTEGER NOT NULL,
    `gift_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `gift_name` VARCHAR(191) NOT NULL,
    `unit_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guest_transitions` ADD CONSTRAINT `guest_transitions_giftsId_fkey` FOREIGN KEY (`giftsId`) REFERENCES `gifts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_transition_items` ADD CONSTRAINT `guest_transition_items_guest_transition_id_fkey` FOREIGN KEY (`guest_transition_id`) REFERENCES `guest_transitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_transition_items` ADD CONSTRAINT `guest_transition_items_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
