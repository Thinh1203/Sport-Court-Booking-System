/*
  Warnings:

  - You are about to drop the column `courtCloudinaryId` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Court` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Court" DROP COLUMN "courtCloudinaryId",
DROP COLUMN "imageUrl";

-- CreateTable
CREATE TABLE "CourtImages" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "CourtImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourtImages" ADD CONSTRAINT "CourtImages_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
