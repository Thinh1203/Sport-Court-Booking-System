import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SportsCenterDto } from './dto/sports-center.dto';
import { Response } from 'express';
import { SportsCenterService } from './sports-center.service';
import { FilterByCommentDto, SportsCenterFilterDto } from './dto/sports-center.filter.dto';
import { SportsCenterDataDto } from './dto/update/data.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { createSportsCenterApiBody } from './swagger';

@ApiTags('sport-center')
@Controller('sports-center')
export class SportsCenterController {
    constructor (
        private readonly sportsCenterService: SportsCenterService
    ) {}

    @Post('')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 201, description: 'Added sport center successfully'})
    @ApiResponse({status: 409, description: 'Sport center already exists'})
    @ApiResponse({status: 400, description: 'Error'})
    @createSportsCenterApiBody
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('files', 5))
    async createSportsCenter (
        @UploadedFiles() files: Express.Multer.File[],
        @Body() sportsCenterDto: SportsCenterDto,
        @Res() res: Response
    ) {
        try {

            if (!files || files.length === 0) {
                throw new BadRequestException('Files is required.');
            }
            const data = await this.sportsCenterService.createSportsCenter(sportsCenterDto, files);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                data: data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    } 

    @Get('')
    @ApiResponse({status: 200, description: 'Get all sport center successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number for pagination' })
    @ApiQuery({ name: 'items_per_page', required: false, type: Number, description: 'Number of items per page for pagination' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search keyword for sports center name' })
    @ApiQuery({ name: 'isBlocked', required: false, type: Boolean, description: 'Filter by blocked status' })
    @ApiQuery({ name: 'latitude', required: false, type: Number, description: 'Latitude to filter sports centers by location' })
    @ApiQuery({ name: 'longtitude', required: false, type: Number, description: 'Longitude to filter sports centers by location' })
    @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Category ID to filter sports centers' })
    @ApiQuery({ name: 'fromPrice', required: false, type: Number, description: 'Minimum price to filter courts' })
    @ApiQuery({ name: 'toPrice', required: false, type: Number, description: 'Maximum price to filter courts' })
    @ApiQuery({ name: 'amenitiesIds', required: false, type: [Number], description: 'List of amenities IDs to filter sports centers' })
    async getAllSportsCenter (
        @Query() query: SportsCenterFilterDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.sportsCenterService.getAllSportsCenter(query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Get('sortByStar')
    @ApiResponse({status: 200, description: 'Get sport center by star successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiQuery({ name: 'latitude', required: false, type: Number, description: 'Latitude to filter sports centers by location' })
    @ApiQuery({ name: 'longtitude', required: false, type: Number, description: 'Longitude to filter sports centers by location' })
    async getAllSportsCenterByStars (
        @Query() query: SportsCenterFilterDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.sportsCenterService.getAllSportsCenterByStars(query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Get('sortByView')
    @ApiResponse({status: 201, description: 'Get sport center by view successfully'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiQuery({ name: 'latitude', required: false, type: Number, description: 'Latitude to filter sports centers by location' })
    @ApiQuery({ name: 'longtitude', required: false, type: Number, description: 'Longitude to filter sports centers by location' })
    async getAllSportsCenterByViews (
        @Query() query: SportsCenterFilterDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.sportsCenterService.getAllSportsCenterByViews(query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Get(':id')
    @ApiResponse({status: 200, description: 'Get sport center by id successfully'})
    @ApiResponse({status: 404, description: 'Sport center not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiQuery({ name: 'isImage', required: false, description: 'Filter comments with images only', type: Boolean })
    @ApiQuery({ name: 'createdAt', required: false, description: 'Sort comments by creation date', type: Boolean })
    @ApiQuery({ name: 'isYou', required: false, description: 'Filter comments by user ID', type: Number })
    async getOneById (  
        @Param('id') id: string,
        @Query() filterByCommentDto: FilterByCommentDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.sportsCenterService.getOneById(Number(id), filterByCommentDto);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Patch(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Updated sport center successfully'})
    @ApiResponse({status: 404, description: 'Sport center not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async updateSportsCenterInformation (
        @Res() res: Response,
        @Param('id') id: string,
        @Body() dataUpdate: SportsCenterDataDto
    ) {
        try {
            await this.sportsCenterService.updateSportsCenterInformation(Number(id), dataUpdate);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Updated successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }

    @Patch('delete/:id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Deleted sport center successfully'})
    @ApiResponse({status: 404, description: 'Sport center not found'})
    @ApiResponse({status: 400, description: 'Error'})
    async deleteSportsCenter (
        @Res() res: Response,
        @Param('id') id: string,
    ) {
        try {
            await this.sportsCenterService.deleteSportsCenter(Number(id));
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Deleted successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }
}
