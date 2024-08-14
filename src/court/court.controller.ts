import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CourtDto } from './dto/court.dto';
import { Response } from 'express';
import { CourtService } from './court.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { courtDataUpdate } from './dto/update/data-update';

@Controller('court')
export class CourtController {
    constructor (
        private readonly courtService: CourtService
    ) {}

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async createCourt (
        @Body() courtDto: CourtDto,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File
    ) : Promise<any> {
        try {
            if (!file) {
                throw new BadRequestException('File is required');
            }   

            const data = await this.courtService.createCourt(courtDto, file);
            return res.status(HttpStatus.CREATED).json({
                message: 'Court created successfully',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

    @Get('')
    async getAll (@Res() res: Response): Promise<any> {
        try {
            const data = await this.courtService.getAll();
            return res.status(HttpStatus.CREATED).json({
                message: 'List of courts: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

    @Get(':id')
    async getOneById (
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.courtService.getById(Number(id));
            return res.status(HttpStatus.CREATED).json({
                message: 'Detail: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }

    @Patch(':id')
    async updateOneById (
        @Param('id') id: string,
        @Body() dataUpdate: courtDataUpdate,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.courtService.updateById(Number(id), dataUpdate);
            return res.status(HttpStatus.CREATED).json({
                message: 'Detail: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            });
        }
    }
}
