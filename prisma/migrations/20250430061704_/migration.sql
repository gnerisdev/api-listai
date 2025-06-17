-- AddForeignKey
ALTER TABLE `event_categories` ADD CONSTRAINT `event_categories_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
