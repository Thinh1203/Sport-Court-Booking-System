import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ListBooking } from './dto/booking.dto';
import { BookingService } from './booking.service';
import { BookingFilterDto } from './dto/booking-filter.dto';

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
                data
            });        
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

           
    @Get('getBookingByUserId')
    @UseGuards(AuthGuard)
    async getBookingByUserId(
        @Res() res: Response,
        @Req() req: Response
    ): Promise<any> {
        try {            
            const user = req['user'];            
            const data = await this.bookingService.getBookingByUserId(Number(user.id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

    @Get('')
    async getAllBooking(
        @Query() query: BookingFilterDto,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.bookingService.getAllBooking(query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }
    
    @Get(':id')
    async getBookingById(
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
  
            const data = await this.bookingService.getBookingById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

 
}
