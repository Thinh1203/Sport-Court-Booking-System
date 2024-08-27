import { ApiBody } from '@nestjs/swagger';

export const registerUserApi = ApiBody({
    description: 'Register user data',
    schema: {
        type: 'object',
        properties: {
            email: { 
                type: 'string',
                example: 'nguyenvana@gmail.com'
            },
            fullName: { 
                type: 'string',
                example: 'Nguyen Van A'
            },
            password: { 
                type: 'string',
                example: '123456'
            },
            numberPhone: {
                type: 'string',
                description: 'Phone number max 10 characters',
                example: '0334469291',
            }
        },
        required: ['email', 'fullName', 'password', 'phoneNumber'],
    }
});

export const loginUserApi = ApiBody({
    description: 'Login user data',
    schema: {
        type: 'object',
        properties: {
            email: { 
                type: 'string',
                example: 'nguyenvana@gmail.com'
            },
            password: { 
                type: 'string',
                example: '123456'
            }
        },
        required: ['email','password'],
    }
});


export const refreshTokenApi = ApiBody({
    description: 'refresh_token',
    schema: {
        type: 'object',
        properties: {
            refresh_token: { 
                type: 'string',
            }
        },
        required: ['refresh_token'],
    }
});

export const forgotPasswordApi = ApiBody({
    description: 'Reset password',
    schema: {
        type: 'object',
        properties: {
            email: { 
                type: 'string',
                example: 'nguyenvana@gmail.com'
            },
            password: {
                type: 'string',
                example: '1234567'
            }
        },
        required: ['email', 'password'],
    }
});

export const verifyOTPApi = ApiBody({
    description: 'Verify OTP',
    schema: {
        type: 'object',
        properties: {
            email: { 
                type: 'string',
                example: 'nguyenvana@gmail.com'
            },
            otp: {
                type: 'string',
                example: '1234'
            }
        },
        required: ['email', 'otp'],
    }
});

export const updateNewPasswordApi = ApiBody({
    description: 'Reset password',
    schema: {
        type: 'object',
        properties: {
            email: { 
                type: 'string',
                example: 'nguyenvana@gmail.com'
            },
            password: {
                type: 'string',
                example: '1234567'
            }
        },
        required: ['email', 'password'],
    }
});