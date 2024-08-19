import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { CategoryDto } from './dto/category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CategoryUpdateData } from './dto/update/data-update.dto';


@Controller('category')
export class CategoryController {
    constructor (
        private readonly categoryService: CategoryService
    ) {}

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async createCategory (
        @Res() res: Response,
        @Body() categoryDto: CategoryDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        try {
            if (!file) {
                throw new BadRequestException('File is required.');
            }
            const data = await this.categoryService.createCategory(categoryDto, file);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'Category added successfully',
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Get('')
    async getAllCategory (
        @Res() res: Response
    ): Promise<any> {
        try {
            const data = await this.categoryService.getAllCategory();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'List of categories: ',
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
    async getCategoryById (
        @Res() res: Response,
        @Param('id') id: string
    ): Promise<any> {
        try {
            const data = await this.categoryService.getCategoryById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
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
    @UseInterceptors(FileInterceptor('file'))
    async updateCategoryById(
        @Body() categoryData: CategoryUpdateData,
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            await this.categoryService.updateCategoryById(Number(id), categoryData, file || null);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Category updated successfully',
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Patch('delete/:id')
    async deleteCategoryById(
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<any> {
        try {
            await this.categoryService.deleteCategoryById(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Category deleted successfully',
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }
}
