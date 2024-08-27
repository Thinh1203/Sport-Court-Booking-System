import { ApiBody } from '@nestjs/swagger';

export const createCommentApiBody = ApiBody({
    description: 'Amenity data with image file',
    schema: {
        type: 'object',
        properties: {
            text: { 
                type: 'string',
                example: 'Good'
            },
            star: { 
                type: 'number',
                example: 5
            },
            courtId: { 
                type: 'number',
                example: 1
            },
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file for the comment'
            }
        },
        required: ['courtId', 'star'],
    }
});