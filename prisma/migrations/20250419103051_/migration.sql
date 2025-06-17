-- AlterTable
ALTER TABLE `events` ADD COLUMN `allow_guest_confirmation` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `show_event_info` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `show_gift_list` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `show_guest_messages` BOOLEAN NOT NULL DEFAULT true;
