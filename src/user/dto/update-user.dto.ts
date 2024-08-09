import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    phoneNumber: string;
    fullName: string;
    isBlocked: boolean;
}
