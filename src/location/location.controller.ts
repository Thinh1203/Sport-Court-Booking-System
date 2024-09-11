import {
  Body,
  Controller,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocationDto } from './dto/location.dto';
import { Response } from 'express';
import { LocationService } from './location.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthGuard)
  async addNewLocation(
    @Res() res: Response,
    @Req() req: Request,
    @Body() locationDto: LocationDto,
  ) {
    try {
      const user = req['user'];
      const data = await this.locationService.addNewLocation(
        locationDto,
        Number(user.id),
      );
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
  @UseGuards(AuthGuard)
  async getLocationByUserId(@Res() res: Response, @Req() req: Request) {
    try {
      const user = req['user'];
      const data = await this.locationService.getLocationByUserId(
        Number(user.id),
      );
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
}
