/*
  Warnings:

  - You are about to drop the column `autor` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `book` table. All the data in the column will be lost.
  - Added the required column `author` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `autor`,
    DROP COLUMN `genero`,
    DROP COLUMN `titulo`,
    ADD COLUMN `author` VARCHAR(191) NOT NULL,
    ADD COLUMN `coverUrl` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('TO_READ', 'READING', 'FINISHED') NOT NULL DEFAULT 'TO_READ',
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
