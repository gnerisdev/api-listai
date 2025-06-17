/*
  Warnings:

  - You are about to drop the column `user_transition_id` on the `event_services` table. All the data in the column will be lost.
  - Added the required column `event_service_transaction_id` to the `event_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_services` DROP COLUMN `user_transition_id`,
    ADD COLUMN `event_service_transaction_id` INTEGER NOT NULL;
