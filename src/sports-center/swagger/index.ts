import { ApiBody } from '@nestjs/swagger';

export const createSportsCenterApiBody = ApiBody({
    description: 'Create a new sports center with multiple images',
    schema: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'TekSport Center',
                description: 'Name of the sports center',
            },
            address: {
                type: 'string',
                example: '123 Sports Avenue',
                description: 'Address of the sports center',
            },
            latitude: {
                type: 'number',
                example: 40.7128,
                description: 'Latitude of the sports center location',
            },
            longtitude: {
                type: 'number',
                example: -74.0060,
                description: 'Longitude of the sports center location',
            },
            openingHour: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        dayOfWeek: {
                            type: 'number',
                            example: 1,
                        },
                        openingTime: {
                            type: 'string',
                            example: '08:00'
                        },
                        closingTime: {
                            type: 'string',
                            example: '22:00'
                        },
                    },
                },
                description: 'Array of opening hours for the sports center. Day of the week (0 for Sunday, 6 for Saturday)',
            },
            files: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image files for the sports center',
                },
            },
        },
        required: ['name', 'address', 'latitude', 'longtitude', 'openingHour', 'files'],
    },
});

