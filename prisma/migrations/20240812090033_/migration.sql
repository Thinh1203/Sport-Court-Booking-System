/*
  Warnings:

  - Added the required column `categoryCloudinaryId` to the `SportsCourt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SportsCourt" ADD COLUMN     "categoryCloudinaryId" TEXT NOT NULL;
