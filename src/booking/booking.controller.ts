import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ListBooking } from './dto/booking.dto';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
    constructor (
        private readonly bookingService: BookingService
    ) {}

    @Post('')
    @UseGuards(AuthGuard)
    async createBooking (
        @Body() bookingDto: ListBooking,
        @Res() res: Response,
        @Req() req: Response
    ): Promise<any> {
        try {
            const user = req['user'];
            const data = await this.bookingService.createdBooking(bookingDto, Number(user.id));
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'data: ',
                data
            })            
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }

}
