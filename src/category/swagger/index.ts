import { ApiBody } from '@nestjs/swagger';

export const createCategoryApiBody = ApiBody({
    description: 'Category data with image file',
    schema: {
        type: 'object',
        properties: {
            type: { 
                type: 'string',
                example: 'Volleyball'
            },
            description: { 
                type: 'string',
                example: 'Volleyball'
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the category'
            }
        },
        required: ['type', 'description', 'file'],
    }
});

export const updateCategoryApiBody = ApiBody({
    description: 'Update category data',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'Volleyball'
            },
            description: { 
                type: 'string',
                example: 'Volleyball'
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the category'
            }
        },
    }
});