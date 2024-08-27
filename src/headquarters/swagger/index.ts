import { ApiBody } from '@nestjs/swagger';

export const createHeadquartersApiBody = ApiBody({
    description: 'Create a new headquarters with an image upload',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'The Sport Center',
                description: 'Name of the headquarters',
            },
            description: { 
                type: 'string',
                example: 'This is the main headquarters for the TekSport.',
                description: 'Description of the headquarters',
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the headquarters',
            },
        },
        required: ['name', 'description', 'file'],
    },
});

export const updateHeadquartersApiBody = ApiBody({
    description: 'Update headquarters data with an optional image file',
    schema: {
        type: 'object',
        properties: {
            name: { 
                type: 'string',
                example: 'The Sport Center',
                description: 'Name of the headquarters',
            },
            description: { 
                type: 'string',
                example: 'Updated description of the headquarters.',
                description: 'Description of the headquarters',
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Optional image file for the headquarters',
            },
        },
    },
});
