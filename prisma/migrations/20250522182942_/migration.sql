/*
  Warnings:

  - You are about to drop the `event_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `event_settings` DROP FOREIGN KEY `event_settings_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `event_settings` DROP FOREIGN KEY `event_settings_user_id_fkey`;

-- DropTable
DROP TABLE `event_settings`;
