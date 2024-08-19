import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdatePasswordByEmail {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}