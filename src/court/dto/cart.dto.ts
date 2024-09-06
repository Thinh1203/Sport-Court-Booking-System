import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsNumber()
  courtId: number;

  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsString()
  userId: string;
}
