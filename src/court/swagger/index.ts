import { ApiBody } from '@nestjs/swagger';

export const createCourtApiBody = ApiBody({
    description: 'Court data with multiple images',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'TekSport'
            },
            price: { 
                type: 'number',
                minimum: 10000,
                example: 50000
            },
            time: { 
                type: 'number',
                maximum: 60,
                example: 60
            },
            sportsCenterId: { 
                type: 'number',
                minimum: 1,
                example: 1
            },
            categoryId: { 
                type: 'number',
                minimum: 1,
                example: 1
            },
            amenitiesIds: {
                type: 'array',
                items: {
                    type: 'number'
                },
                example: [1, 2, 3]
            },
            attributes: {
                type: 'object',
                example: {
                    "width": 70, 
                    "length": 90, 
                    "grassMaterial": "Cỏ nhân tạo", 
                    "numberOfPeople": 11
                }
            },
            files: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'binary',
                },
                description: 'Array of image files for the category'
            }
        },
        required: ['name', 'price', 'time', 'sportsCenterId', 'categoryId', 'amenitiesIds', 'attributes', 'files'],
    }
});

export const updateCourtApiBody = ApiBody({
    description: 'Update court data with optional file uploads',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'Updated Court Name'
            },
            price: { 
                type: 'number',
                example: 75000
            },
            time: { 
                type: 'number',
                example: 90
            },
            discount: { 
                type: 'number',
                example: 10
            },
            isDeleted: { 
                type: 'boolean',
                example: false
            },
            isVip: { 
                type: 'boolean',
                example: true
            },
            attributes: {
                type: 'object',
                example: {
                    "width": 70, 
                    "length": 90, 
                    "grassMaterial": "Synthetic Grass", 
                    "numberOfPeople": 11
                }
            },
            categoryId: { 
                type: 'number',
                example: 2
            },
            amenities: {
                type: 'array',
                items: {
                    type: 'number',
                    example: 1
                },
                example: [1, 2, 3]
            },
            files: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'binary',
                },
                description: 'Array of image files for the court'
            }
        },
    }
});