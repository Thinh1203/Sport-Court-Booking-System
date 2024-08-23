/*
  Warnings:

  - You are about to drop the column `timeCancel` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `timePlay` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cancelTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "timeCancel",
DROP COLUMN "timePlay",
ADD COLUMN     "cancelTime" TEXT NOT NULL,
ADD COLUMN     "checkInTime" TEXT,
ADD COLUMN     "checkOutTime" TEXT,
ADD COLUMN     "playTime" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BillDetail" (
    "id" SERIAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorCode" INTEGER NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "orderAmount" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "clientIp" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "billId" INTEGER NOT NULL,

    CONSTRAINT "BillDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillDetail_billId_key" ON "BillDetail"("billId");

-- AddForeignKey
ALTER TABLE "BillDetail" ADD CONSTRAINT "BillDetail_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
