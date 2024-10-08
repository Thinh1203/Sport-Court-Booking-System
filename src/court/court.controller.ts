import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourtDto } from './dto/court.dto';
import { Response } from 'express';
import { CourtService } from './court.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { courtDataUpdate } from './dto/update/data-update';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParseCourtDtoPipe } from './pipe-validation/parseCourtDtoPipe';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { addNewCart, createCourtApiBody, updateCourtApiBody } from './swagger';
import { CourtFilter } from './dto/court-filter.dto';
import { CartDto } from './dto/cart.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('court')
@Controller('court')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Post('')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiResponse({ status: 201, description: 'Created court successfully' })
  @ApiResponse({
    status: 404,
    description: 'Category or Sport center not found',
  })
  @ApiResponse({ status: 400, description: 'Error' })
  @createCourtApiBody
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 5))
  async createNewCourt(
    @Body(new ParseCourtDtoPipe()) courtDto: CourtDto,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      if (!files) {
        throw new BadRequestException('Files is required');
      }
      const data = await this.courtService.createNewCourt(courtDto, files);
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
  @UseGuards(AuthGuard, AdminGuard)
  @UseInterceptors(CacheInterceptor)
  @ApiBearerAuth()
  async getAll() {
    const data = await this.courtService.getAll();
    return data;
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter booking of court by date',
    example: '2024-08-29',
  })
  async getOneById(@Param('id') id: string, @Query() query: CourtFilter) {
    const data = await this.courtService.getById(Number(id), query);
    return data;
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Updated court successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @ApiConsumes('multipart/form-data')
  @updateCourtApiBody
  @UseInterceptors(FilesInterceptor('files', 5))
  async updateOneById(
    @Param('id') id: string,
    @Body() dataUpdate: courtDataUpdate,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      await this.courtService.updateById(Number(id), dataUpdate, files || null);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Updated successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Post('add-to-cart')
  async addToCart(@Body() cartDto: CartDto, @Res() res: Response) {
    try {
      await this.courtService.addToCart(cartDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
