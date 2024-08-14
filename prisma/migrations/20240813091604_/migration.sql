/*
  Warnings:

  - Added the required column `courtCloudinaryId` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "courtCloudinaryId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL;
