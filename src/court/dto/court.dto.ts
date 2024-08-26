import { IsArray, IsNotEmpty, IsNumber, Min, ArrayMinSize, IsOptional, IsString } from 'class-validator';

export class CourtDto { 
    @IsNotEmpty()
    // @IsString()
    name: string;

    @IsNotEmpty()
    // @IsNumber()
    // @Min(0)
    price: number;
    
    @IsNotEmpty()
    // @IsNumber()
    // @Min(0)
    sportsCenterId: number;
    
    @IsNotEmpty()
    // @IsNumber()
    // @Min(0)
    time: number;
    
    @IsNotEmpty()
    // @IsArray()
    // @ArrayMinSize(1)
    // @IsNumber({}, { each: true })
    amenitiesIds: number[];
    
    @IsNotEmpty()
    // @IsNumber()
    // @Min(0)
    categoryId: number;

    // @IsString()
    attributes?: string;
}
