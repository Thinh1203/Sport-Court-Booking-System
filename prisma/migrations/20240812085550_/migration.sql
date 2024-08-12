-- CreateTable
CREATE TABLE "SportsCourt" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SportsCourt_pkey" PRIMARY KEY ("id")
);
