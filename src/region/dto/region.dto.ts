import { IsNotEmpty, IsString } from "class-validator";

export class RegionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    countryCode: string 
}