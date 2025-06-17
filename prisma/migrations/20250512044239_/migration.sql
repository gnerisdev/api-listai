/*
  Warnings:

  - You are about to drop the column `contact` on the `guest_transitions` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `guest_transitions` table. All the data in the column will be lost.
  - You are about to alter the column `gift_id` on the `guest_transitions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `gift_name` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guest_contact` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guest_name` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `guest_transitions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guest_transitions` DROP COLUMN `contact`,
    DROP COLUMN `name`,
    ADD COLUMN `gift_name` INTEGER NOT NULL,
    ADD COLUMN `guest_contact` VARCHAR(191) NOT NULL,
    ADD COLUMN `guest_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    MODIFY `gift_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `guest_transitions` ADD CONSTRAINT `guest_transitions_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
