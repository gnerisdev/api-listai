-- AddForeignKey
ALTER TABLE `gifts` ADD CONSTRAINT `gifts_event_categories_id_fkey` FOREIGN KEY (`event_categories_id`) REFERENCES `event_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
