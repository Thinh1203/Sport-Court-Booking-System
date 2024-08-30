-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "discountType" TEXT NOT NULL,
    "maxUsage" INTEGER NOT NULL,
    "usedCount" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isDynamic" BOOLEAN NOT NULL,
    "metaData" JSONB,
    "minTotalAmount" INTEGER NOT NULL,
    "MaximumDiscountTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "theSportsCenterId" INTEGER NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillToCoupon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BillToCoupon_AB_unique" ON "_BillToCoupon"("A", "B");

-- CreateIndex
CREATE INDEX "_BillToCoupon_B_index" ON "_BillToCoupon"("B");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_theSportsCenterId_fkey" FOREIGN KEY ("theSportsCenterId") REFERENCES "TheSportsCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToCoupon" ADD CONSTRAINT "_BillToCoupon_A_fkey" FOREIGN KEY ("A") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToCoupon" ADD CONSTRAINT "_BillToCoupon_B_fkey" FOREIGN KEY ("B") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
