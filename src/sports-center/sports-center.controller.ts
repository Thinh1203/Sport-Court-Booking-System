import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SportsCenterDto } from './dto/sports-center.dto';
import { Response } from 'express';
import { SportsCenterService } from './sports-center.service';
import { FilterByCommentDto, SportsCenterFilterDto } from './dto/sports-center.filter.dto';
import { SportsCenterDataDto } from './dto/update/data.dto';

@Controller('sports-center')
export class SportsCenterController {
    constructor (
        private readonly sportsCenterService: SportsCenterService
    ) {}

    @Post('')
    @UseInterceptors(FilesInterceptor('files', 5))
    async createSportsCenter (
        @UploadedFiles() files: Express.Multer.File[],
        @Body() sportsCenterDto: SportsCenterDto,
        @Res() res: Response
    ): Promise<any> {
        try {

            if (!files || files.length === 0) {
                throw new BadRequestException('Files is required.');
            }
            const data = await this.sportsCenterService.createSportsCenter(sportsCenterDto, files);
            return res.status(HttpStatus.CREATED).json({
                code: HttpStatus.CREATED,
                message: 'Added successfully',
                data: data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    } 
    @Get('')
    async getAllSportsCenter (
        @Query() query: SportsCenterFilterDto,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.sportsCenterService.getAllSportsCenter(query);
            return res.status(HttpStatus.CREATED).json({
                code: HttpStatus.CREATED,
                message: 'List of SportsCenter: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Get(':id')
    async getOneById (  
        @Param('id') id: string,
        @Query() filterByCommentDto: FilterByCommentDto,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.sportsCenterService.getOneById(Number(id), filterByCommentDto);
            return res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Detail: ',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Patch(':id')
    async updateSportsCenterInformation (
        @Res() res: Response,
        @Param('id') id: string,
        @Body() dataUpdate: SportsCenterDataDto
    ): Promise<any> {
        try {
            await this.sportsCenterService.updateSportsCenterInformation(Number(id), dataUpdate);
            return res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Updated successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Patch('delete/:id')
    async deleteSportsCenter (
        @Res() res: Response,
        @Param('id') id: string,
    ): Promise<any> {
        try {
            await this.sportsCenterService.deleteSportsCenter(Number(id));
            return res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Deleted successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }
}
