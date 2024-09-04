import { ApiBody } from '@nestjs/swagger';

export const createCouponApiBody = ApiBody({
  description: 'Coupon data with image file',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        example: 'COMPANYTRIP2024',
      },
      description: {
        type: 'string',
        example: 'Incredible hot deal when booking company trip',
      },
      isDynamic: {
        type: 'boolean',
        example: true,
      },
      discountType: {
        type: 'string',
        example: 'flat, percentage',
        description: 'percentage: 10% - 20% - 30%. flat: 100k - 200k- 300k',
      },
      discountValue: {
        type: 'number',
        example: 10,
        description:
          'percentage_value: 10-20-30 or flat_value: 100000 - 200000 - 300000',
      },
      startDate: {
        type: 'string',
        example: '2024-08-16T12:00:00',
      },
      endDate: {
        type: 'string',
        example: '2024-10-18T12:00:00',
      },
      maxUsage: {
        type: 'number',
        example: 1000,
      },
      minTotalAmount: {
        type: 'number',
        example: 1,
        description: 'Minimum order amount to apply discount code',
      },
      status: {
        type: 'string',
        example: 'published',
      },
      MaximumDiscountTotal: {
        type: 'number',
        example: 100000,
        description:
          'The maximum discount amount that the coupon code can apply. Only meaningful for percentage discounts.',
      },
      metaData: {
        type: 'object',
        example: {
          applicableCourts: ['VIP', 'Normal'],
          courtRestrictions: {
            VIP: {
              extraDiscount: 5,
              maxUsagePerUser: 1,
            },
            Normal: {
              maxUsagePerUser: 3,
            },
          },
        },
      },
      theSportsCenterId: {
        type: 'number',
        example: 1,
      },
      file: {
        type: 'string',
        format: 'binary',
        description: 'Image file for the coupon',
      },
    },
    required: [
      'code',
      'description',
      'isDynamic',
      'discountType',
      'discountValue',
      'startDate',
      'endDate',
      'maxUsage',
      'minTotalAmount',
      'status',
      'theSportsCenterId',
    ],
  },
});

export const updateCouponApiBody = ApiBody({
  description: 'Update Coupon',
  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        example: 'COMPANYTRIP2024',
      },
      description: {
        type: 'string',
        example: 'Incredible hot deal when booking company trip',
      },
      isDynamic: {
        type: 'boolean',
        example: true,
      },
      discountType: {
        type: 'string',
        example: 'flat, percentage',
        description: 'percentage: 10% - 20% - 30%. flat: 100k - 200k- 300k',
      },
      discountValue: {
        type: 'number',
        example: 10,
        description:
          'percentage_value: 10-20-30 or flat_value: 100000 - 200000 - 300000',
      },
      startDate: {
        type: 'string',
        example: '2024-08-16T12:00:00',
      },
      endDate: {
        type: 'string',
        example: '2024-10-18T12:00:00',
      },
      maxUsage: {
        type: 'number',
        example: 1000,
      },
      minTotalAmount: {
        type: 'number',
        example: 1,
        description: 'Minimum order amount to apply discount code',
      },  
      status: {
        type: 'string',
        example: 'published',
      },
      MaximumDiscountTotal: {
        type: 'number',
        example: 100000,
        description:
          'The maximum discount amount that the coupon code can apply. Only meaningful for percentage discounts.',
      },
      metaData: {
        type: 'object',
        example: {
          applicableCourts: ['VIP', 'Normal'],
          courtRestrictions: {
            VIP: {
              extraDiscount: 5,
              maxUsagePerUser: 1,
            },
            Normal: {
              maxUsagePerUser: 3,
            },
          },
        },
      },
      file: {
        type: 'string',
        format: 'binary',
        description: 'Image file for the coupon',
      },
    },
  },
});
