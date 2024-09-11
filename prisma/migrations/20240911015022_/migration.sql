-- CreateTable
CREATE TABLE "UserLocation" (
    "id" SERIAL NOT NULL,
    "placeId" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longtitude" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
