import { ApiBody } from "@nestjs/swagger";

export const createBookingApiBody = ApiBody({
    description: 'Booking details including multiple bookings and payment information',
    schema: {
        type: 'object',
        properties: {
            bookingData: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', example: '2024-08-15' },
                        startTime: { type: 'string', example: '15:00' },
                        endTime: { type: 'string', example: '16:00' },
                        courtId: { type: 'number', example: 1 }
                    },
                    required: ['startDate', 'startTime', 'endTime', 'totalPrice', 'courtId']
                },
                example: [
                    {
                        startDate: '2024-08-27',
                        startTime: '08:00',
                        endTime: '09:00',
                        courtId: 1
                    }
                ]
            },
            coupons: { type: 'array', example: [1,2,3,4] },
            paymentMethod: { type: 'string', example: 'ATM' }
        },
        required: ['bookingData', 'amount', 'paymentMethod']
    }
});