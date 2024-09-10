export interface SportCenterDataReturn {
  data: SportCenterData;
  currentPage: number;
  lastPage: number;
  previousPage: any;
  nextPage: any;
  total: number;
  totalComments: number;
}

export interface SportCenterData {
  sports: Sport[];
  regions: any[];
}

export interface Sport {
  id: number;
  name: string;
  address: string;
  status: boolean;
  view: number;
  isDeleted: boolean;
  latitude: number;
  longtitude: number;
  timeRange: any;
  createdAt: string;
  updatedAt: string;
  regionId: any;
  headquartersId?: number;
  headquarters?: Headquarters;
  theSportCenterCourt: TheSportCenterCourt[];
  theSportsCenterImages: TheSportsCenterImage[];
  coupons: Coupon[];
  averageStars: number;
  totalComments: number;
}

export interface Headquarters {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  imageCloudinaryId: string;
}

export interface TheSportCenterCourt {
  id: number;
  name: string;
  price: number;
  discount: number;
  isDeleted: boolean;
  time: number;
  createdAt: string;
  updatedAt: string;
  sportsCenterId: number;
  isVip: boolean;
  categoryId: number;
  attributes: Attributes;
  flagTime: number;
  maximumTime?: number;
  comments: Comment[];
  amenities: Amenity[];
  courtImages: CourtImage[];
  category: Category;
}

export interface Attributes {
  width: number;
  length?: number;
  grassMaterial?: string;
  numberOfPeople: number;
  type?: string;
  height?: number;
  netHeight?: number;
}

export interface Comment {
  id: number;
  star: number;
  text?: string;
  imageUrl: any;
  commentImageCloudinaryId: any;
  createdAt: string;
  updatedAt: string;
  userId: number;
  courtId: number;
}

export interface Amenity {
  id: number;
  name: string;
}

export interface CourtImage {
  id: number;
  imageUrl: string;
  imageId: string;
  courtId: number;
}

export interface Category {
  id: number;
  type: string;
  description: string;
  imageUrl: string;
  categoryCloudinaryId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TheSportsCenterImage {
  id: number;
  imageUrl: string;
  sportsCenterCloudinaryId: string;
  theSportsCenterId: number;
}

export interface Coupon {
  id: number;
  status: string;
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  maxUsage: number;
  usedCount: any;
  startDate: string;
  endDate: string;
  isDynamic: boolean;
  metaData: any;
  minTotalAmount: number;
  imageCloudId: string;
  ImageUrl: string;
  MaximumDiscountTotal?: number;
  createdAt: string;
  updatedAt: string;
  theSportsCenterId: number;
}
