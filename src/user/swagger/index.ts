import { ApiBody } from '@nestjs/swagger';

export const updateUserApi = ApiBody({
    description: 'Update user data',
    schema: {
        type: 'object',
        properties: {
            fullName: { 
                type: 'string',
                example: 'Nguyen Van A'
            },
            // role: { 
            //     type: 'string',
            //     example: 'USER'
            // },
            phoneNumber: {
                type: 'string',
                description: 'Phone number max 10 characters',
                example: '0334469291',
            }
        }
    }
});

export const uploadUserImageFileApi = ApiBody({
    description: 'Upload an image for the user',
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
                description: 'Image file (binary)'
            }
        },
        required: ['file'],
    }
});
