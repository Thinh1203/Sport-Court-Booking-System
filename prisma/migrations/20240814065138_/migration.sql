-- AlterTable
ALTER TABLE "TheSportsCenter" ADD COLUMN     "headquartersId" INTEGER;

-- CreateTable
CREATE TABLE "Headquarters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageCloudinaryId" TEXT NOT NULL,

    CONSTRAINT "Headquarters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TheSportsCenter" ADD CONSTRAINT "TheSportsCenter_headquartersId_fkey" FOREIGN KEY ("headquartersId") REFERENCES "Headquarters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
