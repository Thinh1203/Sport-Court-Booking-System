import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { UpdatePasswordByEmail } from './dto/update-password.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  forgotPasswordApi,
  loginUserApi,
  refreshTokenApi,
  registerUserApi,
  updateNewPasswordApi,
  verifyOTPApi,
} from './swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 201, description: 'Register successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Error' })
  @registerUserApi
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    try {
      const newUser = await this.authService.register(registerUserDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: newUser,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successfully' })
  @ApiResponse({ status: 401, description: 'User or Password incorrect' })
  @ApiResponse({ status: 400, description: 'Error' })
  @loginUserApi
  // @UsePipes(ValidationPipe)
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const token = await this.authService.login(loginUserDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: token,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }

  @Post('refresh-token')
  @ApiResponse({ status: 201, description: 'Created new token successfully' })
  @ApiResponse({ status: 400, description: 'Error' })
  @refreshTokenApi
  async refreshToken(@Body() { refresh_token }, @Res() res: Response) {
    try {
      const token = await this.authService.refreshToken(refresh_token);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: token,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }

  @Post('forgot-password')
  @ApiResponse({ status: 201, description: 'Created token successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @forgotPasswordApi
  async forgotPassword(@Body() { email }, @Res() res: Response) {
    try {
      await this.authService.generateOTP(email);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Email sent successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }

  @Post('generateOTPBooking')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 201, description: 'OTP created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @ApiBearerAuth()
  async generateOTPBooking(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req['user'];
      await this.authService.generateOTPBooking(Number(user.id));
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Email sent successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }
  @Post('verify-otp')
  @ApiResponse({ status: 200, description: 'OTP correct' })
  @ApiResponse({ status: 401, description: 'OTP incorrect' })
  @ApiResponse({ status: 400, description: 'Error' })
  @verifyOTPApi
  async verifyOTP(@Body() { email, otp }, @Res() res: Response) {
    try {
      await this.authService.verifyOTP(email, otp);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }

  @Patch('update-password')
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @updateNewPasswordApi
  async updatePassword(
    @Body() data: UpdatePasswordByEmail,
    @Res() res: Response,
  ) {
    try {
      await this.authService.updateNewPassword(data);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Password updated successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }
}
