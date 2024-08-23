/*
  Warnings:

  - You are about to drop the column `timeBooking` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `timePlay` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "timeBooking",
ADD COLUMN     "timePlay" INTEGER NOT NULL,
ALTER COLUMN "paymentStatus" SET DEFAULT false;
