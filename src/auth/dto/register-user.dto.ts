import { IsEmail, IsNotEmpty, Length, MinLength } from "class-validator";

export class RegisterUserDto {
 
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    password: string;
 
    phoneNumber?: string;

    @IsNotEmpty()
    @MinLength(5)
    fullName: string;
}