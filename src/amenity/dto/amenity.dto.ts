import { IsNotEmpty } from "class-validator";

export class AmenityDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;
}