import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { RegionDto } from './dto/region.dto';
import { RegionService } from './region.service';
import { UpdateRegionData } from './dto/update-region.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createRegionApiBody, updateRegionApiBody } from './swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { FilterRegionDto } from './dto/region-filter.dto';

@ApiTags('region')
@Controller('region')
export class RegionController {
    constructor (
        private readonly regionService: RegionService
    ) {}

    @Post('')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 201, description: 'Created region successfully'})
    @ApiResponse({status: 409, description: 'Region already exists'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiBearerAuth()
    @createRegionApiBody
    @UsePipes(ValidationPipe)
    async createRegion (
        @Body() region: RegionDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.regionService.createRegion(region);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }

    @Get('')
    async getAll (
        @Res() res: Response
    ) {
        try {
            const data = await this.regionService.getAll();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }

    
    @Get(':id')
    @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'FindMany sports-center by category' })
    async getOneById (
        @Param('id', ParseIntPipe) id: number,
        @Query() query: FilterRegionDto,
        @Res() res: Response
    ) {
        try {
            const data = await this.regionService.getOneById(id, query);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }

    @Patch(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiResponse({status: 200, description: 'Updated region successfully'})
    @ApiResponse({status: 404, description: 'Region not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @ApiBearerAuth()
    @updateRegionApiBody
    async updateOneById (
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRegionData: UpdateRegionData,
        @Res() res: Response
    ) {
        try {
            const data = await this.regionService.updateOneById(id, updateRegionData);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Updated region successfully'
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }
}
