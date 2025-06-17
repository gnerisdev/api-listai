-- AlterTable
ALTER TABLE `event_details` MODIFY `start_time` DATETIME(3) NULL,
    MODIFY `end_time` DATETIME(3) NULL,
    MODIFY `event_type` VARCHAR(191) NULL;
