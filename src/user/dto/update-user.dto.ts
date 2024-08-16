export class UpdateUserDto {
    phoneNumber: string;
    fullName: string;
    isBlocked: boolean;
    role: string;
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}