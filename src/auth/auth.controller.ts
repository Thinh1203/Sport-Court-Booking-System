import { Body, Controller, Get, HttpStatus, Patch, Post, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { UpdatePasswordByEmail } from './dto/update-password.dto';
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ) {}

    @Post('register')
    @UsePipes(ValidationPipe)
    async register (@Body() registerUserDto: RegisterUserDto, @Res() res: Response): Promise<any> {
        try {
            const newUser = await this.authService.register(registerUserDto);              
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'User registered successfully',
                data: newUser
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            })
        }
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    async login (@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<any> {
        try {
            const token = await this.authService.login(loginUserDto);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Login successfully',
                data: token
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            })
        }
    }

    @Post('refresh-token')
    async refreshToken(@Body() {refresh_token}, @Res() res: Response): Promise<any> {
        try {
            const token = await this.authService.refreshToken(refresh_token);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'New access_token',
                data: token
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            })
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() { email }, @Res() res: Response): Promise<any> {
        try {
            const otp = await this.authService.generateOTP(email);
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'OTP',
                otp
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            });
        }
    }

    @Post('verify-otp')
    async verifyOTP(@Body() { email, otp }, @Res() res: Response): Promise<any> {
        try {
            await this.authService.verifyOTP(email, otp);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Valid OTP',
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            });
        }
    }

    
    @Patch('update-password')
    async updatePassword(@Body() data: UpdatePasswordByEmail, @Res() res: Response): Promise<any> {
        try {
            await this.authService.updateNewPassword(data);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Password updated successfully',
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: error.message
            });
        }
    }
}
