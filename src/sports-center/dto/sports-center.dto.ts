import { IsArray, IsDecimal, IsInt, IsNotEmpty, Max, Min } from "class-validator";

class OpeningHour {
    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: 'Day must be greater than or equal to 0. 0: Sunday, 1: Monday, 2: Tuesday...' })
    @Max(6, { message: 'Day must be less than or equal to 6. 0: Sunday, 1: Monday, 2: Tuesday...' })
    dayOfWeek: number;     
    
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
    @IsDecimal({ force_decimal: true, decimal_digits: '15'})
    latitude: number;

    @IsNotEmpty()
    @IsDecimal({ force_decimal: true, decimal_digits: '15'})
    longtitude: number;

    @IsArray()
    @IsNotEmpty({ each: true }) 
    openingHour: OpeningHour[]
}