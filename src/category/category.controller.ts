import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { CategoryDto } from './dto/category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CategoryUpdateData } from './dto/update/data-update.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createCategoryApiBody, updateCategoryApiBody } from './swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor (
        private readonly categoryService: CategoryService
    ) {}

    @Post('')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 201, description: 'Created category successfully'})
    @ApiResponse({status: 409, description: 'Category already exists'})
    @ApiResponse({status: 400, description: 'Error'})
    @createCategoryApiBody
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async createCategory (
        @Res() res: Response,
        @Body() categoryDto: CategoryDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            if (!file) {
                throw new BadRequestException('File is required.');
            }
            const data = await this.categoryService.createCategory(categoryDto, file);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
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
    @ApiResponse({status: 200, description: 'Get all category successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    async getAllCategory (
        @Res() res: Response
    ) {
        try {
            const data = await this.categoryService.getAllCategory();
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
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Get category by id successfully'})
    @ApiResponse({status: 404, description: 'Category not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async getCategoryById (
        @Res() res: Response,
        @Param('id') id: string
    ) {
        try {
            const data = await this.categoryService.getCategoryById(Number(id));
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
    @ApiResponse({status: 200, description: 'Updated category successfully'})
    @ApiResponse({status: 404, description: 'Category not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @updateCategoryApiBody
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async updateCategoryById(
        @Body() categoryData: CategoryUpdateData,
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Res() res: Response
    ) {
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
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Deleted category successfully'})
    @ApiResponse({status: 404, description: 'Category not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    async deleteCategoryById(
        @Param('id') id: string,
        @Res() res: Response
    ) {
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
