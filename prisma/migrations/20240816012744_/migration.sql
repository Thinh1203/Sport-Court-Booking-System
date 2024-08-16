/*
  Warnings:

  - You are about to drop the column `theSportsCenterId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `courtId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_theSportsCenterId_fkey";

-- DropIndex
DROP INDEX "Comment_userId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "theSportsCenterId",
ADD COLUMN     "courtId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
