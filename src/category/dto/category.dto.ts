import { IsNotEmpty } from "class-validator";

export class CategoryDto {
    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    description: string;
}