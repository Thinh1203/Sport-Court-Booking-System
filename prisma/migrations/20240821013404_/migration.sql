/*
  Warnings:

  - You are about to drop the column `email` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "email",
DROP COLUMN "fullName",
DROP COLUMN "phoneNumber";
