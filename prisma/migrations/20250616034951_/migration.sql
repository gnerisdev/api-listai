-- AlterTable
ALTER TABLE `event_gift_transactions` MODIFY `guest_contact` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `event_gifts` ADD COLUMN `is_available` BOOLEAN NOT NULL DEFAULT true;
