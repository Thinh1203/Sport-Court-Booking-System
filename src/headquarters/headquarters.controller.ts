import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { HeadquartersDto } from './dto/headquarters.dto';
import { HeadquartersService } from './headquarters.service';
import { headquartersDataUpdate } from './dto/update/data-update.dto';

@Controller('headquarters')
export class HeadquartersController {
    constructor (
        private readonly headquartersService: HeadquartersService
    ) {}

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async createHeadquarters (
        @Res() res: Response,
        @Body() dataDto: HeadquartersDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        try {
            if (!file) {
                throw new BadRequestException('File is required.');
            }
            const data = await this.headquartersService.createHeadquarters(dataDto, file);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'The headquarters added successfully',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message
            });  
        }
    }

    @Get('')
    async getAllHeadquarters (
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.headquartersService.getAll();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'List of headquarters: ',
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
    async getHeadquartersById (
        @Res() res: Response,
        @Param('id') id: string
    ): Promise<any> {
        try {
            const data = await this.headquartersService.getOneById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'The headquarters detail: ',
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
    @UseInterceptors(FileInterceptor('file'))
    async updateCategoryById(
        @Body() headquartersData: headquartersDataUpdate,
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            await this.headquartersService.updateById(Number(id), headquartersData, file || null);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'The headquarters updated successfully',
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message
            });  
        }
    }

    // @Patch('delete/:id')
    // async deleteCategoryById(
    //     @Param('id') id: string,
    //     @Res() res: Response
    // ): Promise<any> {
    //     try {
    //         // await this.categoryService.deleteCategoryById(Number(id));
    //         return res.status(HttpStatus.OK).json({
    //             code: HttpStatus.OK,
    //             message: 'Category deleted successfully',
    //         });
    //     } catch (error) {
    //         return res.status(HttpStatus.BAD_REQUEST).json({
    //             code: HttpStatus.BAD_REQUEST,
    //             message: error.message,
    //         });  
    //     }
    // }
}
