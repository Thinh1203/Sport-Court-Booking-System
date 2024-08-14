/*
  Warnings:

  - Added the required column `amentityCloudinaryId` to the `Amentity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Amentity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Amentity" ADD COLUMN     "amentityCloudinaryId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL;
