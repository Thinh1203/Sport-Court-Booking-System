import { IsArray, IsNotEmpty, IsString } from "class-validator";

class OpeningHour {
    @IsNotEmpty()
    @IsString()
    dayOfWeek: string;     
    
    @IsNotEmpty({ message: 'OpeningTime is string HH:MM:SS.' })
    openingTime: string;

    @IsNotEmpty({ message: 'ClosingTime is string HH:MM:SS.' })
    closingTime:  string;
}

export class SportsCenterDto {
    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    // @IsDecimal({ force_decimal: true, decimal_digits: '15'})
    latitude: number;

    @IsNotEmpty()
    // @IsDecimal({ force_decimal: true, decimal_digits: '15'})
    longtitude: number;

    @IsArray()
    @IsNotEmpty({ each: true }) 
    openingHour: OpeningHour[]
}