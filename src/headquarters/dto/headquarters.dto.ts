import { IsNotEmpty } from "class-validator";

export class HeadquartersDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;
}