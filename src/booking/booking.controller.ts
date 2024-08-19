import { Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('booking')
export class BookingController {
    constructor () {}

    @Post('')
    async createBooking (
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = '';
            return res.status(HttpStatus.CREATED).json({
                message: 'Created successfully',
                data
            })            
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }
}
