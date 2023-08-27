-- AlterTable
ALTER TABLE `accounts` MODIFY `refresh_token` VARCHAR(500) NULL,
    MODIFY `access_token` VARCHAR(500) NULL,
    MODIFY `id_token` VARCHAR(2000) NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `session_token` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `bio` VARCHAR(191) NULL;
