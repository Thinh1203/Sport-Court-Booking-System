import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AmenityService } from './amenity.service';
import { AmenityDto } from './dto/amenity.dto';
import { AmenityData } from './dto/data-update';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { createAmenityApiBody, updateAmenityApiBody } from './swagger';

@ApiTags('amenity')
@Controller('amenity')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Post('')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Added item successfully' })
  @ApiResponse({ status: 409, description: 'Item already exists' })
  @ApiResponse({ status: 400, description: 'Error' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @createAmenityApiBody
  async createAmenity(
    @Body() amenity: AmenityDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }
      const data = await this.amenityService.createAmenity(amenity, file);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get('')
  @ApiResponse({ status: 200, description: 'Get all item successfully' })
  @ApiResponse({ status: 400, description: 'Error' })
  async getAll(@Res() res: Response) {
    try {
      const data = await this.amenityService.getAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get item by id successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  async getOneById(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.amenityService.getOneById(Number(id));
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data,
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
  @ApiBearerAuth()
  @updateAmenityApiBody
  @ApiResponse({ status: 200, description: 'Updated item successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async updateOneById(
    @Body() amenityData: AmenityData,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      await this.amenityService.updateById(
        Number(id),
        amenityData,
        file || null,
      );
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Item updated successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Deleted item successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  async deleteOneById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.amenityService.deleteById(Number(id));
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Item deleted successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
