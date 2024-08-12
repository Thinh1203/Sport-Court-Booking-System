-- CreateTable
CREATE TABLE "TheSportsCenter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "opening" TIMESTAMP(3) NOT NULL,
    "clostingTime" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "view" BIGINT NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longtitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheSportsCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheSportsCenterImages" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "theSportsCenterId" INTEGER NOT NULL,

    CONSTRAINT "TheSportsCenterImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TheSportsCenterImages" ADD CONSTRAINT "TheSportsCenterImages_theSportsCenterId_fkey" FOREIGN KEY ("theSportsCenterId") REFERENCES "TheSportsCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
