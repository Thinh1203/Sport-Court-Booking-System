import { IsArray, IsDecimal, IsNotEmpty, Min } from "class-validator";

export class CourtDto { 
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsDecimal({ force_decimal: true, decimal_digits: '2'})
    @Min(0)
    price: number;

    @IsNotEmpty()
    @Min(1)
    sportsCenterId: number;

    @IsNotEmpty()
    @Min(30)
    time: number;

    @IsNotEmpty()
    // @IsArray()
    amenitiesIds: string;

    @IsNotEmpty()
    @Min(1)
    categoryId: number;

    @IsNotEmpty()
    attributes?: string;
}   