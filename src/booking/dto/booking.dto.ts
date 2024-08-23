import { IsArray, IsDate, IsInt, IsNotEmpty, IsNumber } from "class-validator";

class Booking {
    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    startTime: string;

    @IsNotEmpty()
    endTime: string;

    @IsNotEmpty()
    @IsInt()
    totalPrice: number;

    @IsNotEmpty()
    @IsInt()
    courtId: number;
}

export class ListBooking {
    @IsArray()
    bookingData: Booking[];

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    paymentMethod: string;
}