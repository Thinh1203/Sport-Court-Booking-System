import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

class Booking {
    @IsNotEmpty()
    @IsString()
    startDate: string;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    @IsString()
    endTime: string;

    @IsNotEmpty()
    @IsInt()
    courtId: number;
}

export class ListBooking {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Booking)
    bookingData: Booking[];

    @IsNotEmpty()
    coupons: number[];

    @IsNotEmpty()
    @IsString()
    paymentMethod: string;
}