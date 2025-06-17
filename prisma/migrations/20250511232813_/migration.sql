/*
  Warnings:

  - You are about to drop the column `guest_id` on the `guest_transitions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `guest_transitions` DROP FOREIGN KEY `guest_transitions_gift_id_fkey`;

-- DropForeignKey
ALTER TABLE `guest_transitions` DROP FOREIGN KEY `guest_transitions_guest_id_fkey`;

-- DropIndex
DROP INDEX `guest_transitions_gift_id_idx` ON `guest_transitions`;

-- DropIndex
DROP INDEX `guest_transitions_guest_id_idx` ON `guest_transitions`;

-- AlterTable
ALTER TABLE `guest_transitions` DROP COLUMN `guest_id`,
    MODIFY `gift_id` VARCHAR(191) NOT NULL;
