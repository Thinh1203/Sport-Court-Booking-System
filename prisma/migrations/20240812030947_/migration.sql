/*
  Warnings:

  - Added the required column `sportsCenterCloudinaryId` to the `TheSportsCenterImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TheSportsCenterImages" ADD COLUMN     "sportsCenterCloudinaryId" TEXT NOT NULL;
