export interface CouponInterface {
    status: string;
    code: string;
    description: string;
    discountValue: number;
    discountType: string;
    maxUsage: number;
    usedCount: number | null;
    startDate: string;
    endDate: string;
    isDynamic: boolean;
    metaData: any;
    minTotalAmount: number;
    MaximumDiscountTotal: number;
    theSportsCenterId: number;
    ImageUrl: string;
    imageCloudId: string;
}