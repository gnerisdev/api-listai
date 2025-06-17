ALTER TABLE `gifts` DROP FOREIGN KEY `gifts_event_categories_id_fkey`;

DROP INDEX `gifts_event_categories_id_fkey` ON `gifts`;

ALTER TABLE `events` ADD COLUMN `event_category_id` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `gifts` ADD COLUMN `event_category_id` INTEGER NOT NULL DEFAULT 1;

UPDATE `events` SET `event_category_id` = 1 WHERE `event_category_id` IS NULL;
UPDATE `gifts` SET `event_category_id` = 1 WHERE `event_category_id` IS NULL;

ALTER TABLE `events` ALTER COLUMN `event_category_id` DROP DEFAULT;
ALTER TABLE `gifts` ALTER COLUMN `event_category_id` DROP DEFAULT;

ALTER TABLE `events` DROP COLUMN `event_categories_id`;
ALTER TABLE `gifts` DROP COLUMN `event_categories_id`;

ALTER TABLE `gifts`
  ADD CONSTRAINT `gifts_event_category_id_fkey`
  FOREIGN KEY (`event_category_id`) REFERENCES `event_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
