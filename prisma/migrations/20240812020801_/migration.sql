/*
  Warnings:

  - You are about to drop the column `clostingTime` on the `TheSportsCenter` table. All the data in the column will be lost.
  - You are about to drop the column `opening` on the `TheSportsCenter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TheSportsCenter" DROP COLUMN "clostingTime",
DROP COLUMN "opening";

-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openingTime" TIMESTAMP(3) NOT NULL,
    "closingTime" TIMESTAMP(3) NOT NULL,
    "sportsCenterId" INTEGER NOT NULL,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpeningHour" ADD CONSTRAINT "OpeningHour_sportsCenterId_fkey" FOREIGN KEY ("sportsCenterId") REFERENCES "TheSportsCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
