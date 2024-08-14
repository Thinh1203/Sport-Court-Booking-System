import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AmenityService } from './amenity.service';
import { AmenityDto } from './dto/amenity.dto';
import { AmenityData } from './dto/data-update';

@Controller('amenity')
export class AmenityController {
    constructor (
        private readonly amenityService: AmenityService
    ) {}
    
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async createAmenity (
        @Body() amenity: AmenityDto,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ): Promise<any> {
        try {
            if (!file) {
                throw new BadRequestException('File is required');
            }
            const data = await this.amenityService.createAmenity(amenity, file);
            return res.status(HttpStatus.CREATED).json({
                message: 'Item created successfully',
                data
            });
        } catch (error) {   
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message  
            });
        }
    }

    @Get('')
    async getAll (
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.amenityService.getAll();            
            return res.status(HttpStatus.CREATED).json({
                message: 'List of items: ',
                data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }

    @Get(':id')
    async getOneById (
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.amenityService.getOneById(Number(id));
            return res.status(HttpStatus.CREATED).json({
                message: 'Detail: ',
                data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async updateOneById (
        @Body() amenityData: AmenityData,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ): Promise<any> {
        try {
            
            await this.amenityService.updateById(Number(id), amenityData, file || null);
            return res.status(HttpStatus.CREATED).json({
                message: 'Item updated successfully'
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }

    @Delete(':id')
    async deleteOneById (
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            await this.amenityService.deleteById(Number(id));
            return res.status(HttpStatus.CREATED).json({
                message: 'Item deleted successfully'
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.message
            })
        }
    }
}
