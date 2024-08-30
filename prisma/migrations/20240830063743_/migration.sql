/*
  Warnings:

  - Added the required column `ImageUrl` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageCloudId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "ImageUrl" TEXT NOT NULL,
ADD COLUMN     "imageCloudId" TEXT NOT NULL;
