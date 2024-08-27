import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { HeadquartersDto } from './dto/headquarters.dto';
import { HeadquartersService } from './headquarters.service';
import { headquartersDataUpdate } from './dto/update/data-update.dto';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { createHeadquartersApiBody, updateHeadquartersApiBody } from './swagger';

@ApiTags('headquarter')
@Controller('headquarters')
export class HeadquartersController {
    constructor (
        private readonly headquartersService: HeadquartersService
    ) {}

    @Post('')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 201, description: 'Added successfully'})
    @ApiResponse({status: 409, description: 'Headquarter already exists'})
    @ApiResponse({status: 400, description: 'Error'})
    @createHeadquartersApiBody
    @ApiBearerAuth()
    @ApiConsumes ('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async createHeadquarters (
        @Res() res: Response,
        @Body() dataDto: HeadquartersDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            if (!file) {
                throw new BadRequestException('File is required.');
            }
            const data = await this.headquartersService.createHeadquarters(dataDto, file);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
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
    @ApiResponse({status: 200, description: 'Get all headquarters successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    async getAllHeadquarters (
        @Res() res: Response
    ) {
        try {
            const data = await this.headquartersService.getAll();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
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
    @ApiResponse({status: 200, description: 'Get headquarters by id successfully'})
    @ApiResponse({status: 404, description: 'Headquarter not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async getHeadquartersById (
        @Res() res: Response,
        @Param('id') id: string
    ) {
        try {
            const data = await this.headquartersService.getOneById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
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
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Updated headquarters successfully'})
    @ApiResponse({status: 404, description: 'Headquarter not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @updateHeadquartersApiBody
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async updateCategoryById(
        @Body() headquartersData: headquartersDataUpdate,
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Res() res: Response
    ) {
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
