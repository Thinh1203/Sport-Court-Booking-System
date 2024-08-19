import { IsEmail, IsNotEmpty, Length, MinLength } from "class-validator";

export class LoginUserDto {
    email: string;
    phoneNumber: string;
    @IsNotEmpty()
    password: string;
}