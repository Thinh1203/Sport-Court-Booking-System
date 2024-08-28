import { ApiBody } from '@nestjs/swagger';

export const createRegionApiBody = ApiBody({
    description: 'Region data with image file',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'Can Tho'
            },
            type: { 
                type: 'string',
                example: 'City'
            },
            countryCode: {
                type: 'string',
                example: 'VN'
            }
        },
        required: ['name', 'type', 'countryCode'],
    }
});

export const updateRegionApiBody = ApiBody({
    description: 'Region data with image file',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'Can Tho'
            },
            type: { 
                type: 'string',
                example: 'City'
            },
            countryCode: {
                type: 'string',
                example: 'VN'
            }
        },
    }
});