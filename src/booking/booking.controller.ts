import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ListBooking } from './dto/booking.dto';
import { BookingService } from './booking.service';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
    constructor (
        private readonly bookingService: BookingService
    ) {}

    @Post('')
    @UseGuards(AuthGuard)
    @ApiResponse({status: 201, description: 'Create booking successfully'})
    @ApiResponse({status: 404, description: 'User or court not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async createBooking (
        @Body() bookingDto: ListBooking,
        @Res() res: Response,
        @Req() req: Request
    ) {
        try {
            const user = req['user'];            
            
            const data = await this.bookingService.createdBooking(bookingDto, Number(user.id));
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                data
            });        
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

           
    @Get('getBookingByUserId')
    @UseGuards(AuthGuard)
    @ApiResponse({status: 200, description: 'Get my history booking successfully'})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async getBookingByUserId(
        @Res() res: Response,
        @Req() req: Response
    ) {
        try {            
            const user = req['user'];            
            const data = await this.bookingService.getBookingByUserId(Number(user.id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

    @Get('')
    @ApiResponse({status: 200, description: 'Get all booking successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    async getAllBooking(
        @Query() query: BookingFilterDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.bookingService.getAllBooking(query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }
    
    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiResponse({status: 200, description: 'Get booking by id successfully'})
    @ApiResponse({status: 404, description: 'Booking not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async getBookingById(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            const data = await this.bookingService.getBookingById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });   
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

 
}
