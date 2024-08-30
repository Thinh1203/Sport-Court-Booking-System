import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CouponDto } from './dto/coupon.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createCouponApiBody } from './swagger';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { ParseCouponDtoPipe } from './pipe-validation/parseCouponDtoPipe';

@ApiTags('coupon')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('')
  // @UseGuards(AuthGuard)
  @UsePipes(ParseCouponDtoPipe, ValidationPipe)
  @ApiResponse({ status: 201, description: 'Created coupon successfully' })
  @ApiResponse({ status: 409, description: 'Coupon all already exists' })
  @ApiResponse({ status: 404, description: 'The sports center not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @createCouponApiBody
  async createCoupon(
    @Res() res: Response,
    @Body() couponDto: CouponDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }
      const data = await this.couponService.createCoupon(couponDto, file);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get('')
  async getAll(@Res() res: Response) {
    try {
      const data = await this.couponService.getAll();
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
  async getOnwById(
    @Res() res: Response,
    @Param('id', new ParseIntPipe()) id: number
  ) {
    try {
      const data = await this.couponService.getOneById(id);
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
}
