-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Amentity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Amentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmentityToCourt" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AmentityToCourt_AB_unique" ON "_AmentityToCourt"("A", "B");

-- CreateIndex
CREATE INDEX "_AmentityToCourt_B_index" ON "_AmentityToCourt"("B");

-- AddForeignKey
ALTER TABLE "_AmentityToCourt" ADD CONSTRAINT "_AmentityToCourt_A_fkey" FOREIGN KEY ("A") REFERENCES "Amentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmentityToCourt" ADD CONSTRAINT "_AmentityToCourt_B_fkey" FOREIGN KEY ("B") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
