-- AlterTable
ALTER TABLE `note` ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Note_userId_isFavorite_idx` ON `Note`(`userId`, `isFavorite`);

-- CreateIndex
CREATE INDEX `Note_userId_isPinned_idx` ON `Note`(`userId`, `isPinned`);
