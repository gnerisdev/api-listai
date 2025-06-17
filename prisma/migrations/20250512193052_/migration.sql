-- AlterTable
ALTER TABLE `guest_transitions` ADD COLUMN `system_fee` DOUBLE NULL,
    ADD COLUMN `transaction_fee` DOUBLE NULL,
    ADD COLUMN `user_amount` DOUBLE NULL;
