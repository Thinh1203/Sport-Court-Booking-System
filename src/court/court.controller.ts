import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CourtDto } from './dto/court.dto';
import { Response } from 'express';
import { CourtService } from './court.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { courtDataUpdate } from './dto/update/data-update';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('court')
export class CourtController {
    constructor (
        private readonly courtService: CourtService
    ) {}

    @Post('')
    @UseGuards(AuthGuard, AdminGuard)
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
                statusCode: HttpStatus.CREATED,
                message: 'Court created successfully',
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
    async getAll (@Res() res: Response): Promise<any> {
        try {
            const data = await this.courtService.getAll();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'List of courts: ',
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
    async getOneById (
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.courtService.getById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Detail: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
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

            await this.courtService.updateById(Number(id), dataUpdate);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Updated successfully: '
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }
}
