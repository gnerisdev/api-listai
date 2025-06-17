/*
  Warnings:

  - Added the required column `user_transition_id` to the `event_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_services` ADD COLUMN `user_transition_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `event_services` ADD CONSTRAINT `event_services_user_transition_id_fkey` FOREIGN KEY (`user_transition_id`) REFERENCES `user_transitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
