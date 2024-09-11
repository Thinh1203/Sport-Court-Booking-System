import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterUserDto {
 
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    password: string;
 
    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    @MinLength(5)
    fullName: string;
}