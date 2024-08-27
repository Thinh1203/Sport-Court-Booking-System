import { ApiBody } from '@nestjs/swagger';

export const createAmenityApiBody = ApiBody({
    description: 'Amenity data with image file',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'wifi'
            },
            description: { 
                type: 'string',
                example: 'Wifi free'
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the amenity'
            }
        },
        required: ['name', 'description', 'file'],
    }
});

export const updateAmenityApiBody = ApiBody({
    description: 'Update amenity data',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'Wifi'
            },
            description: { 
                type: 'string',
                example: 'Wifi free'
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the amenity'
            }
        },
    }
});